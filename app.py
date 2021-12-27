from flask import Flask
from flask import request
from database import *
import telegram_bot
from datatypes import User
from config import BOT_TOKEN, URL
from urllib.parse import urlparse

app = Flask(__name__)
bot = telegram_bot.TelegramBot()
db = Database()


@app.route('/')
def index():
    return '<h1>Hello World</h1>'


@app.route(f'/{BOT_TOKEN}', methods=['POST'])
def respond():
    method = request.values['method']
    user = User(username=request.values['username'],
                telegram_chat_id=int(request.values['telegram_chat_id']),
                telegram_first_name=request.values['telegram_first_name'],
                telegram_last_name=request.values['telegram_last_name'])
    if method == 'register':
        try:
            with db:
                status = db.add_user(user)
            return {"status": status}
        except UsernameAlreadyExists as e:
            return {"status": False, "reason": type(e).__name__}
        except ChatIDAlreadyExists as e:
            return {"status": False, "reason": type(e).__name__, "data": e.args[0]}
    elif method == 'remove':
        try:
            with db:
                status = db.delete_user(user)
            return {"status": status}
        except UserNotExist as e:
            return {"status": False, "reason": type(e).__name__}
        except UnauthorizedDeletion as e:
            return {"status": False, "reason": type(e).__name__}


if __name__ == '__main__':
    url = urlparse(URL)
    app.run(host=url.hostname, port=url.port, debug=True)
