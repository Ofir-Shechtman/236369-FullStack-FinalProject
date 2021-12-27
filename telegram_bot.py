import logging
import requests
from telegram import Update
from config import BOT_TOKEN, URL
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext

# Enable logging
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)


def parse_request(update: Update):
    method = update.effective_message.text.split(' ')[0]
    telegram_user = update.effective_user
    parsed_request = {"method": method.lstrip('/'),
                      "chat_id": int(telegram_user.id),
                      "first_name": telegram_user.first_name,
                      "last_name": telegram_user.last_name
                      }
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


def user_handler(update: Update, context: CallbackContext) -> None:
    parsed_request = parse_request(update)
    result = requests.post(f'{URL}{BOT_TOKEN}', parsed_request).json()

    if result['status']:
        method = parsed_request['method'].rstrip('e')  # edit name for message
        chat_id = parsed_request['chat_id']
        update.message.reply_text(f'Success! 😄 *{chat_id}* has been {method}ed', parse_mode='Markdown')

    elif result['reason'] == "DBUserExists":
        update.message.reply_text(f'Failed! 😩 You are already registered')

    elif result['reason'] == "DBUserNotFound":
        update.message.reply_text(f'Failed! 😩 You are not registered')


class TelegramBot(Updater):
    def __init__(self):
        super().__init__(BOT_TOKEN)
        # on different commands - answer in Telegram
        self.dispatcher.add_handler(CommandHandler("start", start))
        self.dispatcher.add_handler(CommandHandler("register", user_handler))
        self.dispatcher.add_handler(CommandHandler("remove", user_handler))
        # on non command i.e. message - echo the message on Telegram
        self.dispatcher.add_handler(MessageHandler(Filters.text & ~Filters.command, start))

    def run(self):
        self.start_polling()
        self.idle()


if __name__ == '__main__':
    bot = TelegramBot()
    bot.run()
