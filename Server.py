from flask import Flask
from Database import Database
from TelegramBot import TelegramBot, Update, CallbackContext


app = Flask(__name__)
NL = '\n'

@app.route('/')
def index():
    return '<h1>Hello World</h1>'


@app.route('/user/<name>')
def user(name):
    return f'<h1>Hello, {name}</h1>'


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
    with database as db:
        db.add_user()
    update.message.reply_text(fr'Success! 😄 {NL}*{user_id}* has been registered.', parse_mode='Markdown')


def remove(update: Update, context: CallbackContext) -> None:
    try:
        user_id = parse_registration_message(update.effective_message.text)
    except ValueError as e:
        update.message.reply_text(f'Failed! 😩 {NL}Please supply exactly one user name. Received {e.args[0] - 1}')
        return
    update.message.reply_text(fr'Success! 😄 {NL}*{user_id}* has been removed.', parse_mode='Markdown')



if __name__ == '__main__':
    database = Database()
    bot = TelegramBot(start, register, remove)
    app.run(debug=True)
