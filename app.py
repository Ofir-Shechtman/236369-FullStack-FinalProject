from flask import Flask
from flask import request
import database
import telegram_bot
from datatypes import User
from config import BOT_TOKEN, URL

app = Flask(__name__)
bot = telegram_bot.TelegramBot()
db = database.Database()


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
        return {"status": register_db(user)}
    elif method == 'remove':
        return {"status": remove_db(user)}


def register_db(user):
    try:
        with db:
            db.add_user(user)
        return True
    except BaseException:
        return False


def remove_db(user):
    try:
        with db:
            return db.delete_user(user)
    except BaseException:
        return False


if __name__ == '__main__':
    bot.run(threaded=True)
    app.run()
