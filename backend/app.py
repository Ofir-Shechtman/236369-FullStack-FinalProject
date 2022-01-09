import os

from flask import Flask, render_template, request, send_from_directory, Response, redirect
from flask_login import LoginManager, login_required, login_user, logout_user
from config import BOT_TOKEN, URL, DATABASE_URL, SUPER_ADMIN, SECRET_KEY
from urllib.parse import urlparse
import database as db
import requests
from typing import List
import json
import urllib
from statuses import Status

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.secret_key = SECRET_KEY
login_manager = LoginManager()
login_manager.session_protection = 'strong'
login_manager.login_view = 'login'
login_manager.login_message = u"Bonvolu ensaluti por uzi tiun paĝon."
login_manager.init_app(app)
super_admin = db.init(app, SUPER_ADMIN)
super_admin_id = super_admin.id


@login_manager.user_loader
def user_loader(admin_id):
    return db.load_admin(admin_id)


@app.before_request
def oauth_verify(*args, **kwargs):
    """Ensure the oauth authorization header is set"""
    if request.method in ['OPTIONS', ]:
        response = Response("OK")
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")
        return response


@app.route("/button", methods=['POST'])
def button():
    if request.method == 'POST':
        print(request.get_json().get('title'))
        return Response("OK")


@app.route('/login', methods=['GET', 'POST'])
def login():
    user = db.get_admin(username="admin")
    if user and user.verify_password("236369"):
        login_user(user)
        return redirect('/')


@app.route("/logout")
@login_required
def logout():
    logout_user()


@app.route("/", methods=['GET', 'POST'])
@login_required
def index():
    if request.method == 'POST':
        if request.form.get('message'):
            _send_message(chat_id=569667677, text="Hello World!")
        elif request.form.get('poll'):
            poll_id = send_poll(receivers=[569667677], question="How are you today?",
                                options=["Good!", "Great!", "Fantastic!"], allows_multiple_answers=True, admin_id=super_admin_id)
            # stop_poll(poll_id)
        elif request.form.get('inline'):
            send_poll(receivers=[569667677], question="How are you today?", options=["Good!", "Great!", "Fantastic!"],
                       inline=True, admin_id=super_admin_id)

    elif request.method == 'GET':
        return render_template('index.html')
    return render_template('index.html')


@app.route('/api/time')
def get_current_time():
    return {'time': 9}


@app.route(f'/{BOT_TOKEN}', methods=['POST'])
def respond() -> Status:
    method = request.values['method']
    if method == 'register':
        try:
            db.add_user(chat_id=int(request.values.get('chat_id')),
                        first_name=request.values.get('first_name'),
                        last_name=request.values.get('last_name'))
        except (db.UserExists, db.UserAlreadyActive) as e:
            return Status('DBUserExists')
    elif method == 'remove':
        try:
            db.remove_user(chat_id=int(request.values['chat_id']))
        except (db.UserNotFound, db.UserNotActive) as e:
            return Status('DBUserNotFound')
    elif method == 'receive_poll_answer':
        for answer in request.values['answers']:
            db.add_answer_by_poll_id(chat_id=int(request.values.get('chat_id')),
                                     telegram_poll_id=request.values.get('poll_id'),
                                     option_id=int(answer))
    elif method == 'button':
        db.add_answer_by_message_id(chat_id=int(request.values.get('chat_id')),
                                    message_id=int(request.values.get('message_id')),
                                    option_id=int(request.values['answers']))
    else:
        raise Exception
    return Status('SUCCESS')


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')


def _send_bot_post(method: str, query: dict):
    to_post = f'https://api.telegram.org/bot{BOT_TOKEN}/{method}?{urllib.parse.urlencode(query)}'
    return requests.post(to_post)


def _bot_send_poll(chat_id, question: str, options: List[str], close_date: int = None,
                   allows_multiple_answers: bool = False):
    locals_args = locals()
    locals_args['options'] = json.dumps(options)
    locals_args['is_anonymous'] = False
    return _send_bot_post("sendPoll", locals_args)


def _bot_stop_poll(chat_id, message_id):
    return _send_bot_post("stopPoll", locals())


def _send_message(chat_id: int, text: str, reply_markup=None):
    return _send_bot_post("sendMessage", locals())


def send_poll(receivers, question: str, options: List[str], admin_id, close_date: int = None,
              allows_multiple_answers: bool = False, inline: bool = False):
    poll_id = db.add_poll(question=question, options=options, created_by=admin_id, close_date=close_date if not inline else None,
                          allows_multiple_answers=allows_multiple_answers and not inline)
    for chat_id in receivers:
        if inline:
            reply_markup = {
                "inline_keyboard": [[dict(text=option, callback_data=i)] for i, option in enumerate(options)]
            }
            result = _send_message(chat_id, question, reply_markup=json.dumps(reply_markup))
        else:

            result = _bot_send_poll(chat_id, question, options, close_date,
                                    allows_multiple_answers)
        data = result.json().get('result')
        db.add_poll_receiver(chat_id=chat_id, poll_id=poll_id, sent_by=admin_id,
                             telegram_poll_id=data['poll']['id'] if not inline else None,
                             message_id=data['message_id'])
    return poll_id


def stop_poll(poll_id):
    poll = db.get_poll(poll_id)
    db.stop_poll(poll)
    for poll_receiver in poll.poll_receivers:
        _bot_stop_poll(poll_receiver.user_id, poll_receiver.message_id)


def _send_inline_keyboard(receivers, question: str, options: List[str]):
    reply_markup = {
        "inline_keyboard": [[dict(text=option, callback_data=i)] for i, option in enumerate(options)]
    }
    for chat_id in receivers:
        result = _send_message(chat_id, question, reply_markup=json.dumps(reply_markup))
    return 0


if __name__ == '__main__':
    url = urlparse(URL)
    app.run(host=url.hostname, port=url.port, debug=True)
