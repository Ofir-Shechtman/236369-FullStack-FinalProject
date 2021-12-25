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




class TelegramBot(Updater):

    @staticmethod
    def send_success(update, user_id):
        update.message.reply_text(fr'Success! 😄 {NL}*{user_id}* has been removed.', parse_mode='Markdown')

    def __init__(self, start, register, remove):
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

    def sent_poll(self):
        # TODO how to (chat_id?)
        pass


if __name__ == '__main__':
    bot = TelegramBot()
    bot.run()
