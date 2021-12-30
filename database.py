from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
from models import Users, Polls, Answers, Votes
_db = SQLAlchemy()


def init(app):
    _db.init_app(app)


class DBUserNotFound(BaseException):
    pass


class DBUserExists(BaseException):
    pass


class DBUnknownError(BaseException):
    pass


def add_user(chat_id: int, first_name: str, last_name: str = None) -> None:
    new_user = Users(chat_id=chat_id, first_name=first_name, last_name=last_name)
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
    user = _db.session.query(Users).filter_by(chat_id=chat_id).first()
    if not user:
        raise DBUserNotFound
    try:
        _db.session.delete(user)
        _db.session.commit()
    except Exception:
        _db.session.rollback()
        raise DBUnknownError