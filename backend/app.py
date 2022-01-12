import datetime
import os

from flask import Flask, render_template, request, send_from_directory, Response, jsonify
from config import BOT_TOKEN, URL, DATABASE_URL, SUPER_ADMIN, SECRET_KEY
from urllib.parse import urlparse
import database as db
import requests
from typing import List
import json
import urllib
from statuses import Status
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, \
                               unset_jwt_cookies, jwt_required, JWTManager

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.secret_key = SECRET_KEY

app.config["JWT_SECRET_KEY"] = "please-remember-to-change-me"
jwt = JWTManager(app)

super_admin = db.init(app, SUPER_ADMIN)


@app.route('/token', methods=["POST"])
def create_token():
    username = request.json.get("username", None)
    password = request.json.get("password", None)
    if not db.get_verified_admin(username, password):
        return {"msg": "Wrong email or password"}, 401

    access_token = create_access_token(identity=username)
    response = {"access_token": access_token}
    return response

@app.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response

def get_admin():
    return db.get_admin(get_jwt()['sub'])


@app.route('/profile')
@jwt_required()
def my_profile():
    response_body = {
        "username": get_admin().username
    }

    return response_body


@app.route("/", methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if request.form.get('message'):
            _send_message(chat_id=569667677, text="Hello World!")
        elif request.form.get('poll'):
            poll_id = send_poll(poll_name='poll1', receivers=[569667677, 2123387537], question="How are you today?",
                                options=["Good!", "Great!", "Fantastic!"], allows_multiple_answers=True, admin_id=get_admin().id)
            # stop_poll(poll_id)
        elif request.form.get('inline'):
            send_poll(poll_name='poll2', receivers=[569667677, 2123387537], question="What is the time now?", options=["2pm Israel", "7pm Thailand"],
                       inline=True, admin_id=get_admin().id)

    elif request.method == 'GET':
        return render_template('index.html')
    return render_template('index.html')


@app.route('/api/polls', methods=['GET'])
@jwt_required()
def get_posts():
    return db.get_polls_data('admin')


@app.route('/api/polls_to_send', methods=['GET'])
@jwt_required()
def get_polls_to_send():
    return db.get_poll_to_send('admin')


@app.route('/api/add_poll', methods=['POST'])
@jwt_required()
def add_poll():
    try:
        data = request.get_json()
        close_data = None
        poll_type = data.get('PollType')
        auto_close_time = data.get('AutoCloseTime')
        if data.get('AutoClosingSwitch') and auto_close_time and poll_type=="Telegram_poll":
            close_data = datetime.datetime.now()+ datetime.timedelta(minutes=auto_close_time)
        allows_multiple_answers = poll_type=="Telegram_poll" and data.get('MultipleAnswers')
        db.add_poll(poll_name=data.get('PollName'),
                    options=data.get('MultipleOptions'),
                    question=data.get('PollQuestion'),
                    poll_type=poll_type,
                    allows_multiple_answers=allows_multiple_answers,
                    close_date=close_data,
                    created_by=get_admin().id)
    except BaseException:
        return Response('Error', 500)
    return Response()


@app.route('/api/add_admin', methods=['POST'])
@jwt_required()
def add_admin():
    try:
        data = request.get_json()
        db.add_admin(username=data.get('username'),
                    password=data.get('password'),
                    created_by=get_admin().id)
    except BaseException:
        return Response('Error', 500)
    return Response()

@app.route('/api/send_poll', methods=['POST'])
@jwt_required()
def send_poll():
    try:
        data = request.get_json()
        poll = db.get_poll(data['poll']['selected_poll_id'])
        regular_poll = poll.poll_type == "Telegram_poll"
        poll_options = [option.content for option in poll.poll_options]
        users = data['users']
        for chat_id in users:
            if regular_poll:
                result = _bot_send_poll(chat_id, poll.question, poll_options, poll.close_date,
                                        poll.allows_multiple_answers)
            else:
                reply_markup = {
                    "inline_keyboard": [[dict(text=option, callback_data=i)] for i, option in enumerate(poll_options)]
                }
                result = _send_message(chat_id, poll.question, reply_markup=json.dumps(reply_markup))


            data = result.json().get('result')
            db.add_poll_receiver(chat_id=chat_id, poll_id=poll.poll_id, sent_by=poll.admin.id,
                                 telegram_poll_id=data['poll']['id'] if regular_poll else None,
                                 message_id=data['message_id'])

    except BaseException:
        return Response('Error', 500)
    return Response()


@app.route('/api/delete_poll', methods=['POST'])
@jwt_required()
def delete_poll():
    try:
        data = request.get_json()
        db.delete_poll(data.get('poll_id'))
    except BaseException:
        return Response('Error', 500)
    return Response()

@app.route(f'/{BOT_TOKEN}', methods=['POST'])
@jwt_required()
def respond() -> Status:
    data = json.loads(request.get_json())
    method = data['method']
    if method == 'register':
        try:
            db.add_user(chat_id=int(data.get('chat_id')),
                        first_name=data.get('first_name'),
                        last_name=data.get('last_name'))
        except (db.UserExists, db.UserAlreadyActive) as e:
            return Status('DBUserExists')
    elif method == 'remove':
        try:
            db.remove_user(chat_id=int(data['chat_id']))
        except (db.UserNotFound, db.UserNotActive) as e:
            return Status('DBUserNotFound')
    elif method == 'receive_poll_answer':
        for answer in data['answers']:
            db.add_answer_by_poll_id(chat_id=int(data.get('chat_id')),
                                     telegram_poll_id=data.get('poll_id'),
                                     option_id=int(answer))
    elif method == 'button':
        db.add_answer_by_message_id(chat_id=int(data.get('chat_id')),
                                    message_id=int(data.get('message_id')),
                                    option_id=int(data['answers']))
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


def send_poll(poll_name, receivers, question: str, options: List[str], admin_id, close_date: int = None,
              allows_multiple_answers: bool = False, inline: bool = False):
    poll_type= "Telegram_inline_keyboard" if inline else "Telegram_poll"
    poll_id = db.add_poll(poll_name=poll_name, poll_type=poll_type, question=question, options=options, created_by=admin_id, close_date=close_date if not inline else None,
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
