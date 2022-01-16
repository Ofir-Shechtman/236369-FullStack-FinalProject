import datetime
import time
from flask import Flask, request, Response, jsonify
from urllib.parse import urlparse
import requests
import json
import urllib
from datetime import timedelta
from typing import List
from flask_jwt_extended import create_access_token, get_jwt, \
    unset_jwt_cookies, jwt_required, JWTManager
from .statuses import Status
from .config import BOT_TOKEN, FLASK_URL, DATABASE_URL, SUPER_ADMIN, SECRET_KEY
from . import database as db

app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.secret_key = SECRET_KEY

app.config["JWT_SECRET_KEY"] = SECRET_KEY
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=4)
jwt = JWTManager(app)

super_admin = db.init(app, SUPER_ADMIN)


@app.route('/')
def index():
    return app.send_static_file('index.html')


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


@app.route('/api/profile')
@jwt_required()
def my_profile():
    response_body = {
        "username": get_admin().username
    }
    return response_body


@app.route('/api/polls', methods=['GET'])
@jwt_required()
def get_posts():
    return db.get_polls_data(get_admin().username)


@app.route('/api/admins', methods=['GET'])
@jwt_required()
def get_admins():
    return db.get_admins()


@app.route('/api/polls_to_send', methods=['GET'])
@jwt_required()
def get_polls_to_send():
    return db.get_poll_to_send(get_admin().username)


@app.route('/api/add_poll', methods=['POST'])
@jwt_required()
def add_poll():
    try:
        data = request.get_json()
        close_data = None
        poll_type = data.get('PollType')
        auto_close_time = data.get('AutoCloseTime')
        if data.get('AutoClosingSwitch') and auto_close_time and poll_type == "Telegram_poll":
            close_data = datetime.datetime.now() + datetime.timedelta(minutes=auto_close_time)
        allows_multiple_answers = poll_type == "Telegram_poll" and data.get('MultipleAnswers')
        db.add_poll(poll_name=data.get('PollName'),
                    options=data.get('MultipleOptions'),
                    question=data.get('PollQuestion'),
                    poll_type=poll_type,
                    allows_multiple_answers=allows_multiple_answers,
                    close_date=close_data,
                    created_by=get_admin().id)
    except db.PollExists:
        return Response('PollExists', 500)
    except db.OptionExists:
        return Response('OptionExists', 500)
    except db.UnknownError:
        return Response('Database UnknownError', 500)
    except Exception:
        return Response('Server UnknownError', 500)
    return Response()


@app.route('/api/add_admin', methods=['POST'])
@jwt_required()
def add_admin():
    try:
        data = request.get_json()
        db.add_admin(username=data.get('username'),
                     password=data.get('password'),
                     created_by=get_admin().id)
    except db.UserExists:
        return Response('UserExists', 500)
    except BaseException:
        return Response('Error', 500)
    return Response()


@app.route('/api/send_poll', methods=['POST'])
@jwt_required()
def send_poll():
    try:
        data = request.get_json()
        poll = db.get_poll(data['poll'])
        users = data['users']
        results = []
        for user in users:
            status = _send_poll(poll, user['chat_id'])
            results.append({"name": user['user'], 'status': status})
    except BaseException:
        return Response('Error', 500)
    return {"results": results}


@app.route('/api/stop_poll', methods=['POST'])
@jwt_required()
def stop_poll():
    try:
        data = request.get_json()
        poll = db.get_poll(data['poll_id'])
        db.stop_poll(poll)
        for poll_receiver in poll.poll_receivers:
            _bot_stop_poll(poll_receiver.user_id, poll_receiver.message_id)
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
def respond() -> Response:
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
        try:
            for answer in data['answers']:
                chat_id = int(data.get('chat_id'))
                answer = db.add_answer_by_poll_id(chat_id=chat_id,
                                                  telegram_poll_id=data.get('poll_id'),
                                                  option_id=int(answer))
                if answer.option.followup_poll:
                    _send_poll(answer.option.followup_poll, chat_id)
        except Exception:
            return Status('Unknown')
    elif method == 'button':
        try:
            chat_id = int(data.get('chat_id'))
            answer = db.add_answer_by_message_id(chat_id=chat_id,
                                                 message_id=int(data.get('message_id')),
                                                 option_id=int(data['answers']))
            if answer.option.followup_poll:
                _send_poll(answer.option.followup_poll, chat_id)
            return {"question": answer.option.poll.question, 'option': answer.option.content}
        except Exception:
            return Status('Unknown')
    else:
        return Status('Unknown')
    return Status('SUCCESS')


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


def _send_poll(poll, chat_id):
    try:
        if chat_id in [receiver.user_id for receiver in poll.poll_receivers]:
            return "PollAlreadySent"
        regular_poll = poll.poll_type == "Telegram_poll"
        poll.poll_options.sort(key=lambda option: option.option_id)
        poll_options = [option.content for option in poll.poll_options]
        unix_time = int(time.mktime(poll.close_date.timetuple())) if poll.close_date else None
        if regular_poll:
            result = _bot_send_poll(chat_id, poll.question, poll_options, unix_time,
                                    poll.allows_multiple_answers)
        else:
            reply_markup = {
                "inline_keyboard": [[dict(text=option, callback_data=i)] for i, option in enumerate(poll_options)]
            }
            result = _send_message(chat_id, poll.question, reply_markup=json.dumps(reply_markup))
        if not result.json().get('ok'):
            return "PollNotSent"
        data = result.json().get('result')
        db.add_poll_receiver(chat_id=chat_id, poll_id=poll.poll_id, sent_by=poll.admin.id,
                             telegram_poll_id=data['poll']['id'] if regular_poll else None,
                             message_id=data['message_id'])
    except db.PollAlreadySent:
        return "PollSentAgain"
    except db.UnknownError:
        return "DatabaseUnknownError"
    return "Success"


def _send_inline_keyboard(receivers, question: str, options: List[str]):
    reply_markup = {
        "inline_keyboard": [[dict(text=option, callback_data=i)] for i, option in enumerate(options)]
    }
    for chat_id in receivers:
        result = _send_message(chat_id, question, reply_markup=json.dumps(reply_markup))
    return 0


if __name__ == '__main__':
    url = urlparse(FLASK_URL)
    app.run(host=url.hostname, port=url.port, debug=True)
