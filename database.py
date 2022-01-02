from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
from models import Users, Polls, PollOptions, PollAnswers, PollReceivers
import datetime

_db = SQLAlchemy()


def init(app):
    _db.init_app(app)


class UserNotFound(BaseException):
    pass


class UserNotActive(BaseException):
    pass


class UserAlreadyActive(BaseException):
    pass


class UserExists(BaseException):
    pass


class PollNotFound(BaseException):
    pass


class PollExists(BaseException):
    pass


class AnswerNotFound(BaseException):
    pass


class AnswerExists(BaseException):
    pass


class OptionNotFound(BaseException):
    pass


class OptionExists(BaseException):
    pass


class PollAlreadySent(BaseException):
    pass


class PollNotSent(BaseException):
    pass


class UnknownError(BaseException):
    pass


def add_user(chat_id: int, first_name: str, last_name: str = None) -> None:
    try:
        user = _get_user(chat_id)
        if user.is_active:
            raise UserAlreadyActive
        user.is_active = True
        _db.session.commit()
        return
    except UserNotFound:
        pass
    new_user = Users(user_id=chat_id, first_name=first_name, last_name=last_name)
    try:
        _db.session.add(new_user)
        _db.session.commit()
    except IntegrityError:
        _db.session.rollback()
        raise UserExists
    except BaseException:
        _db.session.rollback()
        raise UnknownError


def _get_user(chat_id):
    user = _db.session.query(Users).get(chat_id)
    if not user:
        raise UserNotFound
    return user


def remove_user(chat_id: int) -> None:
    user = _get_user(chat_id)
    if not user.is_active:
        raise UserNotActive
    user.is_active = False
    _db.session.commit()


def delete_user(chat_id: int) -> None:
    user = _get_user(chat_id)
    try:
        _db.session.delete(user)
        _db.session.commit()
    except Exception:
        _db.session.rollback()
        raise UnknownError


def get_poll(poll_id):
    poll = _db.session.query(Polls).get(poll_id)
    if not poll:
        raise PollNotFound
    return poll


def _get_option(poll_id, option_id):
    option = _db.session.query(PollOptions).get((option_id, poll_id))
    if not option:
        raise OptionNotFound
    return option


def _get_poll_receiver_by_poll_id(chat_id, telegram_poll_id):
    poll_receiver = _db.session.query(PollReceivers).filter_by(user_id=chat_id, telegram_poll_id=telegram_poll_id).first()
    if not poll_receiver:
        raise PollNotSent
    return poll_receiver


def _get_poll_receiver_by_message_id(chat_id, message_id):
    poll_receiver = _db.session.query(PollReceivers).filter_by(user_id=chat_id, message_id=message_id).first()
    if not poll_receiver:
        raise PollNotSent
    return poll_receiver


def _add_answer(answer: PollAnswers):
    # TODO: unactive user can answer poll?
    try:
        _db.session.add(answer)
        _db.session.commit()
    except IntegrityError:
        _db.session.rollback()
        raise AnswerExists
    except BaseException:
        _db.session.rollback()
        raise UnknownError


def add_answer_by_poll_id(chat_id, telegram_poll_id, option_id):
    _get_user(chat_id)
    poll_receiver = _get_poll_receiver_by_poll_id(chat_id, telegram_poll_id)
    _get_option(poll_receiver.poll_id, option_id)
    new_answer = PollAnswers(user_id=chat_id, poll_id=poll_receiver.poll_id, option_id=option_id)
    _add_answer(new_answer)


def add_answer_by_message_id(chat_id, message_id, option_id):
    _get_user(chat_id)
    poll_receiver = _get_poll_receiver_by_message_id(chat_id, message_id)
    _get_option(poll_receiver.poll_id, option_id)
    new_answer = PollAnswers(user_id=chat_id, poll_id=poll_receiver.poll_id, option_id=option_id)
    _add_answer(new_answer)


def _get_answer(chat_id, poll_id, answer_index):
    answer = _db.session.query(PollAnswers).filter_by(user_id=chat_id, poll_id=poll_id,
                                                      answer_index=answer_index).first()
    if not answer:
        raise AnswerNotFound
    return answer


def _add_only_poll(question, allows_multiple_answers, close_date):
    new_poll = Polls(question=question, allows_multiple_answers=allows_multiple_answers, close_date=close_date)
    try:
        _db.session.add(new_poll)
        _db.session.commit()
    except IntegrityError:
        _db.session.rollback()
        raise PollExists
    except BaseException:
        _db.session.rollback()
        raise UnknownError
    return new_poll.poll_id


def _add_option(option_id, poll_id, content):
    get_poll(poll_id)
    new_option = PollOptions(option_id=option_id, poll_id=poll_id, content=content)
    try:
        _db.session.add(new_option)
        _db.session.commit()
    except IntegrityError:
        _db.session.rollback()
        raise OptionExists
    except BaseException:
        _db.session.rollback()
        raise UnknownError


def add_poll(question, options, allows_multiple_answers=False, close_date=None):
    poll_id = _add_only_poll(question=question, allows_multiple_answers=allows_multiple_answers, close_date=close_date)
    for option_index, option in enumerate(options):
        _add_option(option_index, poll_id, option)
    return poll_id


def send_poll(poll_id, receivers):
    get_poll(poll_id)
    for chat_id in receivers:
        add_poll_receiver(chat_id, poll_id)


def add_poll_receiver(chat_id, poll_id, message_id, telegram_poll_id):
    _get_user(chat_id)
    get_poll(poll_id)
    new_poll_receiver = PollReceivers(user_id=chat_id, poll_id=poll_id, message_id=message_id,
                                      telegram_poll_id=telegram_poll_id)
    try:
        _db.session.add(new_poll_receiver)
        _db.session.commit()
    except IntegrityError:
        _db.session.rollback()
        raise PollAlreadySent
    except BaseException:
        _db.session.rollback()
        raise UnknownError


def stop_poll(poll: Polls):
    poll.close_date = datetime.datetime.now()
