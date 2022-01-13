import logging
import requests
from telegram import Update, Poll, ParseMode
from telegram.bot import BotCommand
from config import BOT_TOKEN, URL
from telegram.ext import Updater, CommandHandler, PollAnswerHandler, MessageHandler, Filters, CallbackContext, \
    CallbackQueryHandler
from telegram import InlineKeyboardButton, InlineKeyboardMarkup
from statuses import Method, Status, ReturnMessage, StatusInline
import json
# Enable logging
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)


def parse_request(update: Update, method: Method):
    telegram_user = update.effective_user
    parsed_request = {"method": method,
                      "chat_id": int(telegram_user.id),
                      "first_name": telegram_user.first_name,
                      "last_name": telegram_user.last_name
                      }
    if method == "receive_poll_answer":
        answer = update.poll_answer
        parsed_request.update({"answers": answer.option_ids,
                               "poll_id": answer.poll_id})
    elif method == "button":
        query = update.callback_query
        query.answer()
        parsed_request.update({"answers": query.data,
                               "message_id": query.message.message_id})
    return parsed_request


def start(update: Update, context: CallbackContext) -> None:
    """Send a message when the command /start is issued."""
    user = update.effective_user
    update.message.reply_text(f'Hi {user.first_name}.')
    update.message.reply_text(f'Welcome to Ben & Ofir\'s awesome polling system.\n'
                              f'You can control me by sending these commands: ')
    update.message.reply_text(
        f'/register - Subscribe to our polling system.\n'
        f'/remove - Unsubscribe from our polling system.\n'
        f'/start - To see this menu again'
    )


def post(function):
    def handler(update: Update, context: CallbackContext):
        parsed_request = parse_request(update, function.__name__)
        result = requests.post(f'{URL}{BOT_TOKEN}', json=json.dumps(parsed_request))
        function(update, context, result)

    return handler


def user_handler(update: Update, context: CallbackContext, result: Status, method: Method) -> None:
    if result.text == 'SUCCESS':
        context.bot.send_message(update.effective_user.id,
                                 f"Success! 😄 {update.effective_user.mention_html()} has been {method.rstrip('e')}ed",
                                 parse_mode=ParseMode.HTML)

    elif result.text == 'DBUserExists':
        update.message.reply_text(f'Failed! 😩 You are already registered')

    elif result.text == 'DBUserNotFound':
        update.message.reply_text(f'Failed! 😩 You are not registered')


@post
def register(update: Update, context: CallbackContext, result: ReturnMessage):
    user_handler(update, context, result, "register")


@post
def remove(update: Update, context: CallbackContext, result: ReturnMessage):
    user_handler(update, context, result, "remove")


@post
def receive_poll_answer(update: Update, context: CallbackContext, result) -> None:
    """Summarize a users poll vote"""
    answer = update.poll_answer
    poll_id = answer.poll_id
    # try:
    #     questions = context.bot_data[poll_id]["questions"]
    # # this means this poll answer update is from an old poll, we can't do our answering then
    # except KeyError:
    #     return
    # selected_options = answer.option_ids
    # answer_string = ""
    # for question_id in selected_options:
    #     if question_id != selected_options[-1]:
    #         answer_string += questions[question_id] + " and "
    #     else:
    #         answer_string += questions[question_id]
    # context.bot.send_message(
    #     context.bot_data[poll_id]["chat_id"],
    #     f"{update.effective_user.mention_html()} feels {answer_string}!",
    #     parse_mode=ParseMode.HTML,
    # )
    # context.bot_data[poll_id]["answers"] += 1
    # # Close poll after three participants voted
    # if context.bot_data[poll_id]["answers"] == 3:
    #     context.bot.stop_poll(
    #         context.bot_data[poll_id]["chat_id"], context.bot_data[poll_id]["message_id"]
    #     )


def poll(update: Update, context: CallbackContext) -> None:
    """Sends a predefined poll"""
    questions = ["Good", "Really good", "Fantastic", "Great"]
    message = context.bot.send_poll(
        update.effective_chat.id,
        "How are you?",
        questions,
        is_anonymous=False,
        allows_multiple_answers=True,
        open_period=10,
        type=Poll.QUIZ, correct_option_id=2
    )
    # Save some info about the poll the bot_data for later use in receive_poll_answer
    payload = {
        message.poll.id: {
            "questions": questions,
            "message_id": message.message_id,
            "chat_id": update.effective_chat.id,
            "answers": 0,
        }
    }
    context.bot_data.update(payload)


def inline(update: Update, context: CallbackContext) -> None:
    """Sends a message with three inline buttons attached."""
    keyboard = [
        [
            InlineKeyboardButton("Option 1", callback_data='1'),
            InlineKeyboardButton("Option 2", callback_data='2'),
        ],
        [InlineKeyboardButton("Option 3", callback_data='3')],
    ]

    reply_markup = InlineKeyboardMarkup(keyboard)

    update.message.reply_text('Please choose:', reply_markup=reply_markup)

@post
def button(update: Update, context: CallbackContext, result) -> None:
    """Parses the CallbackQuery and updates the message text."""
    query = update.callback_query

    # CallbackQueries need to be answered, even if no notification to the user is needed
    # Some clients may have trouble otherwise. See https://core.telegram.org/bots/api#callbackquery
    query.answer()
    data = result.json()
    query.edit_message_text(text=f"<u>{data.get('question')}</u>\n<b>Your answer: </b><i>{data.get('option')}</i>", parse_mode="HTML")


class TelegramBot(Updater):
    def __init__(self):
        super().__init__(BOT_TOKEN)
        # on different commands - answer in Telegram
        self.dispatcher.add_handler(CommandHandler("start", start))
        self.dispatcher.add_handler(CommandHandler("register", register))
        self.dispatcher.add_handler(CommandHandler("remove", remove))
        self.dispatcher.add_handler(CommandHandler("poll", poll))
        self.dispatcher.add_handler(CommandHandler("inline", inline))
        self.dispatcher.add_handler(CallbackQueryHandler(button))
        self.dispatcher.add_handler(PollAnswerHandler(receive_poll_answer))
        # on non command i.e. message - echo the message on Telegram
        self.dispatcher.add_handler(MessageHandler(Filters.text & ~Filters.command, start))

        self.bot.set_my_commands([BotCommand("start", "See the menu"),
                                  BotCommand("register", "Subscribe to our polling system"),
                                  BotCommand("remove", "Unsubscribe from our polling system")])
        # BotCommand("remove", "to unregister to the system")

    def run(self):
        self.start_polling()
        self.idle()


if __name__ == '__main__':
    bot = TelegramBot()
    bot.run()
