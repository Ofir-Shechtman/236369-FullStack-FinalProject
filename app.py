from flask import Flask, render_template, request
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
            send_message(chat_id=569667677, text="Hello World!")
        elif request.form.get('poll'):
            result = send_poll(chat_id=569667677, question="How are you today?", options=["Good!", "Great!"])
            data = result.json().get('result')
            try:
                db.add_poll(poll_id=data['poll']['id'], question=data['poll']['question'], options=data['poll']['options'], message_id=data['message_id'], open_date=data['date'], allows_multiple_answers=data['poll']['allows_multiple_answers'], close_date=None)
            except db.UserExists as e:
                return Status('DBUserExists')
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
                          poll_id=request.values.get('poll_id'),
                          option_id=int(answer))
    else:
        raise Exception
    return Status('SUCCESS')


def send_bot_post(method: str, query: dict):
    to_post = f'https://api.telegram.org/bot{BOT_TOKEN}/{method}?{urllib.parse.urlencode(query)}'
    return requests.post(to_post)


def send_poll(chat_id, question: str, options: List[str], close_date: int = None,
              allows_multiple_answers: bool = False):
    locals_args = locals()
    locals_args['options'] = json.dumps(options)
    locals_args['is_anonymous'] = False
    return send_bot_post("sendPoll", locals_args)


def send_message(chat_id: int, text: str):
    return send_bot_post("sendMessage", locals())


if __name__ == '__main__':
    url = urlparse(URL)
    app.run(host=url.hostname, port=url.port, debug=True)
