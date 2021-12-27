from flask import Flask
from flask import request
from flask_sqlalchemy import SQLAlchemy
from psycopg2.errors import UniqueViolation
from config import BOT_TOKEN, URL, DATABASE_URL
from urllib.parse import urlparse

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db = SQLAlchemy(app)


class User(db.Model):
    __tablename__ = 'users'
    chat_id = db.Column(db.BigInteger, primary_key=True, nullable=False)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=True)

    def __repr__(self):
        return f'<User {self.chat_id}>'


class Poll(db.Model):
    __tablename__ = 'polls'
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    text = db.Column(db.String, nullable=False)

    def __repr__(self):
        return f'<Poll {self.text}>'


class Answer(db.Model):
    __tablename__ = 'answers'
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    poll_id = db.Column(db.Integer, db.ForeignKey('polls.id'), nullable=False)
    text = db.Column(db.String, nullable=False)

    def __repr__(self):
        return f'<Answer {self.text}>'


class Vote(db.Model):
    __tablename__ = 'votes'
    chat_id = db.Column(db.BigInteger, db.ForeignKey('users.chat_id'), primary_key=True, nullable=False)
    poll_id = db.Column(db.Integer, db.ForeignKey('polls.id'), primary_key=True, nullable=False)
    answer_id = db.Column(db.Integer, db.ForeignKey('answers.id'), nullable=False)

    def __repr__(self):
        return f'<Vote {self.poll_id}:{self.answer_id}>'


def add_user(chat_id: int, first_name: str, last_name: str) -> bool:
    if last_name:
        new_user = User(chat_id=chat_id, first_name=first_name, last_name=last_name)
    else:
        new_user = User(chat_id=chat_id, first_name=first_name)
    try:
        db.session.add(new_user)
        db.session.commit()
        return True
    except:
        db.session.rollback()
        return False


def delete_user(chat_id: int) -> int:
    user = User.query.filter_by(chat_id=chat_id).first()
    if not user:
        return False
    try:
        db.session.delete(user)
        db.session.commit()
        return True
    except:
        db.session.rollback()


@app.route('/')
def index():
    return '<h1>Hello World</h1>'


@app.route(f'/{BOT_TOKEN}', methods=['POST'])
def respond():
    method = request.values['method']
    last_name = request.values['last_name'] if 'last_name' in request.values.keys() else None
    if method == 'register':
        success = add_user(chat_id=int(request.values['chat_id']),
                           first_name=request.values['first_name'],
                           last_name=last_name)
        if success:
            return {"status": True}
        else:
            return {"status": False, "reason": "ChatIdExist"}
    elif method == 'remove':
        success = delete_user(chat_id=int(request.values['chat_id']))
        if success:
            return {"status": True}
        else:
            return {"status": False, "reason": "ChatIdNotExist"}


if __name__ == '__main__':
    url = urlparse(URL)
    # db.drop_all()
    # db.create_all()
    app.run(host=url.hostname, port=url.port, debug=True)
