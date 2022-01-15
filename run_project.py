from urllib.parse import urlparse
from backend.app import app
from backend.config import FLASK_URL
from backend.telegram_bot import TelegramBot

if __name__ == '__main__':
    bot = TelegramBot()
    bot.run(threaded=True)
    url = urlparse(FLASK_URL)
    app.run(host=url.hostname, port=url.port, debug=False)
