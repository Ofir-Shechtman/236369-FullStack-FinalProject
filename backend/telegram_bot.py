import threading
import logging
import requests
from telegram import Update, ParseMode
from telegram.bot import BotCommand
from telegram.ext import Updater, CommandHandler, PollAnswerHandler, MessageHandler, Filters, CallbackContext, \
    CallbackQueryHandler
import json
from .config import BOT_TOKEN, FLASK_URL
from .statuses import Method, Status, ReturnMessage
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
        result = requests.post(f'{FLASK_URL}{BOT_TOKEN}', json=json.dumps(parsed_request))
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


@post
def button(update: Update, context: CallbackContext, result) -> None:
    """Parses the CallbackQuery and updates the message text."""
    query = update.callback_query

    query.answer()
    data = result.json()
    query.edit_message_text(text=f"<u>{data.get('question')}</u>\n<b>Your answer: </b><i>{data.get('option')}</i>", parse_mode="HTML")


class TelegramBot(Updater):
    def __init__(self):
        super().__init__(BOT_TOKEN)
        self.dispatcher.add_handler(CommandHandler("start", start))
        self.dispatcher.add_handler(CommandHandler("register", register))
        self.dispatcher.add_handler(CommandHandler("remove", remove))
        self.dispatcher.add_handler(CallbackQueryHandler(button))
        self.dispatcher.add_handler(PollAnswerHandler(receive_poll_answer))
        self.dispatcher.add_handler(MessageHandler(Filters.text & ~Filters.command, start))

        self.bot.set_my_commands([BotCommand("start", "See the menu"),
                                  BotCommand("register", "Subscribe to our polling system"),
                                  BotCommand("remove", "Unsubscribe from our polling system")])

    def run(self, threaded=False):
        if threaded:
            t = threading.Thread(target=self.start_polling)
            t.start()
            t.join()
        else:
            self.start_polling()
            self.idle()


if __name__ == '__main__':
    bot = TelegramBot()
    bot.run()
