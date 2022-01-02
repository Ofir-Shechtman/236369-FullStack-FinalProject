import os

from flask import Flask, render_template, request, send_from_directory
from config import BOT_TOKEN, URL, DATABASE_URL
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
db.init(app)


@app.route("/", methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if request.form.get('message'):
            _send_message(chat_id=569667677, text="Hello World!")
        elif request.form.get('poll'):
            poll_id = send_poll(receivers=[569667677, 2123387537], question="How are you today?", options=["Good!", "Great!", "Fantastic!"], allows_multiple_answers=True)
            stop_poll(poll_id)
        elif request.form.get('inline'):
            send_inline_keyboard(receivers=[569667677, 2123387537], question="How are you today?", options=["Good!", "Great!", "Fantastic!"])

    elif request.method == 'GET':
        return render_template('index.html')
    return render_template('index.html')


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
            db.add_answer(chat_id=int(request.values.get('chat_id')),
                          telegram_poll_id=request.values.get('poll_id'),
                          option_id=int(answer))
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


def send_poll(receivers, question: str, options: List[str], close_date: int = None,
              allows_multiple_answers: bool = False):
    poll_id = db.add_poll(question=question, options=options, close_date=close_date,
                          allows_multiple_answers=allows_multiple_answers)
    for chat_id in receivers:
        result = _bot_send_poll(chat_id, question, options, close_date,
                                allows_multiple_answers)
        data = result.json().get('result')
        db.add_poll_receiver(chat_id=chat_id, poll_id=poll_id, telegram_poll_id=data['poll']['id'],
                             message_id=data['message_id'])
    return poll_id


def stop_poll(poll_id):
    poll = db.get_poll(poll_id)
    db.stop_poll(poll)
    for poll_receiver in poll.poll_receivers:
        _bot_stop_poll(poll_receiver.user_id, poll_receiver.message_id)


def send_inline_keyboard(receivers, question: str, options: List[str]):
    reply_markup = {
            "inline_keyboard": [
                [
                    {"text": "Yes", "url": "http://www.google.com/"},
                    {"text": "No", "url": "http://www.google.com/"}
                ]
            ]
        }
    print(reply_markup)
    reply_markup = {
        "inline_keyboard": [[dict(text=option, callback_data=i)] for i, option in enumerate(options)]
    }
    print(reply_markup)
    for chat_id in receivers:
        result = _send_message(chat_id, question, reply_markup=json.dumps(reply_markup))
    return 0


if __name__ == '__main__':
    url = urlparse(URL)
    app.run(host=url.hostname, port=url.port, debug=True)
