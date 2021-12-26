from flask import Flask
import database as db
import telegram_bot as tb

app = Flask(__name__)
database = db.Database()


def register(user):
    try:
        with database as d:
            d.add_user(user)
        return True
    except BaseException as e:
        return False


def remove(user):
    try:
        with database as d:
            return d.delete_user(user)
    except BaseException:
        return False



bot = tb.TelegramBot(tb.create_register(register), tb.create_remove(remove))


@app.route('/')
def index():
    return '<h1>Hello World</h1>'


@app.route('/user/<name>')
def user(name):
    return f'<h1>Hello, {name}</h1>'


if __name__ == '__main__':
    app.run(debug=True)
