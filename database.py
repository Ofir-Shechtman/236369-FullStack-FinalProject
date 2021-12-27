from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
_db = SQLAlchemy()


def init(app):
    _db.init_app(app)


class DBUserNotFound(BaseException):
    pass


class DBUserExists(BaseException):
    pass


class DBUnknownError(BaseException):
    pass


class User(_db.Model):
    __tablename__ = 'users'
    chat_id = _db.Column(_db.BigInteger, primary_key=True, nullable=False)
    first_name = _db.Column(_db.String, nullable=False)
    last_name = _db.Column(_db.String, nullable=True)

    def __repr__(self):
        return f'<User {self.chat_id}>'


class Poll(_db.Model):
    __tablename__ = 'polls'
    id = _db.Column(_db.Integer, primary_key=True, nullable=False)
    text = _db.Column(_db.String, nullable=False)

    def __repr__(self):
        return f'<Poll {self.text}>'


class Answer(_db.Model):
    __tablename__ = 'answers'
    id = _db.Column(_db.Integer, primary_key=True, nullable=False)
    poll_id = _db.Column(_db.Integer, _db.ForeignKey('polls.id'), nullable=False)
    text = _db.Column(_db.String, nullable=False)

    def __repr__(self):
        return f'<Answer {self.text}>'


class Vote(_db.Model):
    __tablename__ = 'votes'
    chat_id = _db.Column(_db.BigInteger, _db.ForeignKey('users.chat_id'), primary_key=True, nullable=False)
    poll_id = _db.Column(_db.Integer, _db.ForeignKey('polls.id'), primary_key=True, nullable=False)
    answer_id = _db.Column(_db.Integer, _db.ForeignKey('answers.id'), nullable=False)

    def __repr__(self):
        return f'<Vote {self.poll_id}:{self.answer_id}>'


def add_user(chat_id: int, first_name: str, last_name: str) -> None:
    if last_name:
        new_user = User(chat_id=chat_id, first_name=first_name, last_name=last_name)
    else:
        new_user = User(chat_id=chat_id, first_name=first_name)
    try:
        _db.session.add(new_user)
        _db.session.commit()
    except IntegrityError:
        _db.session.rollback()
        raise DBUserExists
    except BaseException:
        _db.session.rollback()
        raise DBUnknownError


def delete_user(chat_id: int) -> None:
    user = User.query.filter_by(chat_id=chat_id).first()
    if not user:
        raise DBUserNotFound
    try:
        _db.session.delete(user)
        _db.session.commit()
    except Exception:
        _db.session.rollback()
        raise DBUnknownError


if __name__ == '__main__':
    _db.drop_all()
    _db.create_all()
