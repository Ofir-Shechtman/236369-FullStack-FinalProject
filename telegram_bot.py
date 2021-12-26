import logging
from datatypes import User, BadUsername
from telegram import Update, ForceReply
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext

# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO
)

logger = logging.getLogger(__name__)

NL = '\n'
BOT_TOKEN = "5026874157:AAGLISmllwAvfOGq6lB5OqxRfOF_wufIJWA"


class NoUsername(BaseException):
    pass


def _start(update: Update, context: CallbackContext) -> None:
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


def _get_user(update: Update):
    username = update.effective_message.text.split(' ', 1)
    if len(username) != 2:
        raise NoUsername()
    telegram_user = update.effective_user
    return User(username[1], telegram_user.id, telegram_user.first_name, telegram_user.last_name)


def create_register(server_register):
    def register(update: Update, context: CallbackContext) -> None:
        try:
            user = _get_user(update)
        except BadUsername as e:
            update.message.reply_text(
                f'Failed! 😩 {NL}Username "{e.username}" has been is received, Please supply a valid user name')
            return
        except NoUsername as e:
            update.message.reply_text(
                f'Failed! 😩 {NL}No Username has been is received, Please supply a valid user name')
            return
        result = server_register(user)
        if result:
            update.message.reply_text(fr'Success! 😄 {NL}*{user.username}* has been registered.', parse_mode='Markdown')
        else:
            update.message.reply_text(f'Failed! 😩 {NL}Please supply exactly one user name. Received Error')
    return register


def create_remove(server_remove):
    def remove(update: Update, context: CallbackContext) -> None:
        try:
            user = _get_user(update)
        except BadUsername as e:
            update.message.reply_text(
                f'Failed! 😩 {NL}Username "{e.username}" has been is received, Please supply a valid user name')
            return
        except NoUsername as e:
            update.message.reply_text(
                f'Failed! 😩 {NL}No Username has been is received, Please supply a valid user name')
            return
        result = server_remove(user)
        if result:
            update.message.reply_text(fr'Success! 😄 {NL}*{user.username}* has been removed.', parse_mode='Markdown')
        else:
            update.message.reply_text(f'Failed! 😩 {NL}Please supply exactly one user name. Received Error')

    return remove


class TelegramBot(Updater):
    def __init__(self, register, remove):
        super().__init__(BOT_TOKEN)

        # on different commands - answer in Telegram
        self.dispatcher.add_handler(CommandHandler("start", _start))
        self.dispatcher.add_handler(CommandHandler("register", register))
        self.dispatcher.add_handler(CommandHandler("remove", remove))

        # on non command i.e message - echo the message on Telegram
        self.dispatcher.add_handler(MessageHandler(Filters.text & ~Filters.command, _start))

    def run(self):
        # Start the Bot
        self.start_polling()
        # self.start_webhook(webhook_url=r'http://127.0.0.1:5000/')

        # Run the bot until you press Ctrl-C or the process receives SIGINT,
        # SIGTERM or SIGABRT. This should be used most of the time, since
        # start_polling() is non-blocking and will stop the bot gracefully.
        self.idle()

    def sent_poll(self):
        # TODO how to (chat_id?)
        pass


if __name__ == '__main__':
    def always_true(_):
        return True


    bot = TelegramBot(create_register(always_true), create_remove(always_true))
    bot.run()
