import logging

from telegram import Update, ForceReply
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext

# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO
)

logger = logging.getLogger(__name__)

NL = '\n'
BOT_TOKEN = "5026874157:AAGLISmllwAvfOGq6lB5OqxRfOF_wufIJWA"


def parse_registration_message(message: str):
    res = message.split(' ')
    if len(res) != 2:
        raise ValueError(len(res))
    return res[1]


# Define a few command handlers. These usually take the two arguments update and
# context.
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


def register(update: Update, context: CallbackContext) -> None:
    try:
        user_id = parse_registration_message(update.effective_message.text)
    except ValueError as e:
        update.message.reply_text(f'Failed! 😩 {NL}Please supply exactly one user name. Received {e.args[0] - 1}')
        return
    update.message.reply_text(fr'Success! 😄 {NL}*{user_id}* has been registered.', parse_mode='Markdown')


def remove(update: Update, context: CallbackContext) -> None:
    try:
        user_id = parse_registration_message(update.effective_message.text)
    except ValueError as e:
        update.message.reply_text(f'Failed! 😩 {NL}Please supply exactly one user name. Received {e.args[0] - 1}')
        return
    update.message.reply_text(fr'Success! 😄 {NL}*{user_id}* has been removed.', parse_mode='Markdown')


class TelegramBot(Updater):
    def __init__(self):
        super().__init__(BOT_TOKEN)

        # on different commands - answer in Telegram
        self.dispatcher.add_handler(CommandHandler("start", start))
        self.dispatcher.add_handler(CommandHandler("register", register))
        self.dispatcher.add_handler(CommandHandler("remove", remove))

        # on non command i.e message - echo the message on Telegram
        self.dispatcher.add_handler(MessageHandler(Filters.text & ~Filters.command, start))

    def run(self):
        # Start the Bot
        self.start_polling()

        # Run the bot until you press Ctrl-C or the process receives SIGINT,
        # SIGTERM or SIGABRT. This should be used most of the time, since
        # start_polling() is non-blocking and will stop the bot gracefully.
        self.idle()


if __name__ == '__main__':
    bot = TelegramBot()
    bot.run()
