import logging
import threading

import requests
from datatypes import CHECK_USERNAME, BadUsername
from telegram import Update, ForceReply
from config import BOT_TOKEN, URL
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext

# Enable logging
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)


class NoUsername(BaseException):
    pass


def start(update: Update, context: CallbackContext) -> None:
    """Send a message when the command /start is issued."""
    user = update.effective_user
    update.message.reply_text(f'Hi {user.first_name}.')
    update.message.reply_text(f'Welcome to Ben & Ofir\'s awesome polling system.\n'
                              f'You can control me by sending these commands: ')
    update.message.reply_text(
        f'/register <user-name> - Register to start answering polls via telegram.\n'
        f' <user-name> in smart polling system\n\n'
        f'/remove <user-name> - To stop getting polls queries.\n'
        f' <user-name> in smart polling system\n\n'
        f'/start - Use start anytime to see this menu again'
    )


def parse_request(update: Update):
    try:
        method, username = update.effective_message.text.split(' ', 1)
    except ValueError:
        raise NoUsername()
    if not CHECK_USERNAME.match(username):
        raise BadUsername(username)
    telegram_user = update.effective_user
    parsed_request = {"method": method.lstrip('/'),
                      "username": username,
                      "telegram_chat_id": int(telegram_user.id),
                      "telegram_first_name": telegram_user.first_name,
                      "telegram_last_name": telegram_user.last_name
                      }
    return parsed_request


def user_handler(update: Update, context: CallbackContext) -> None:
    try:
        parsed_request = parse_request(update)
        method = parsed_request['method']
        username = parsed_request['username']
    except BadUsername as e:
        update.message.reply_text(
            f'Failed! 😩\n'
            f'{e.username} doesn\'t match user\'s syntax')
        return
    except NoUsername:
        update.message.reply_text(
            f'Failed! 😩\n'
            f'No Username has been given')
        return
    result = requests.post(f'{URL}{BOT_TOKEN}', parsed_request)
    if result:
        update.message.reply_text(f'Success! 😄\n'
                                  f'*{username}* has been {method}ed.', parse_mode='Markdown')
    else:
        update.message.reply_text(f'Failed! 😩\n'
                                  f'Please supply exactly one user name. Received Error')


class TelegramBot(Updater):
    def __init__(self):
        super().__init__(BOT_TOKEN)
        # on different commands - answer in Telegram
        self.dispatcher.add_handler(CommandHandler("start", start))
        self.dispatcher.add_handler(CommandHandler("register", user_handler, pass_args=True))
        self.dispatcher.add_handler(CommandHandler("remove", user_handler, pass_args=True))
        # on non command i.e message - echo the message on Telegram
        self.dispatcher.add_handler(MessageHandler(Filters.text & ~Filters.command, start))

    def run(self, threaded=False):
        if threaded:
            t = threading.Thread(target=self.start_polling)
            t.start()
            t.join()
        else:
            self.start_polling()
            self.idle()

    def sent_poll(self):
        # TODO how to (chat_id?)
        pass


if __name__ == '__main__':
    bot = TelegramBot()
    bot.run()
