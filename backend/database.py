from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from flask import jsonify
from sqlalchemy.exc import IntegrityError
import datetime
from backend.models import Admin, User, Poll, PollOption, PollAnswer, PollReceiver

_db = SQLAlchemy()


def init(app, super_admin):
    _db.init_app(app)
    username, password = super_admin
    with app.app_context():
        try:
            return get_admin(username)
        except AdminNotFound:
            admin = add_admin(username, password, None)
            return admin


class UserNotFound(BaseException):
    pass


class UserNotActive(BaseException):
    pass


class UserAlreadyActive(BaseException):
    pass


class UserExists(BaseException):
    pass


class AdminNotFound(BaseException):
    pass


class AdminExists(BaseException):
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


def add_admin(username: str, password: str, created_by: int) -> Admin:
    admin = Admin(username=username, password=password, created_by=created_by)
    try:
        _db.session.add(admin)
        _db.session.commit()
        return admin
    except IntegrityError:
        _db.session.rollback()
        raise UserExists
    # except BaseException:
    #     _db.session.rollback()
    #     raise UnknownError


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
    new_user = User(user_id=chat_id, first_name=first_name, last_name=last_name)
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
    user = _db.session.query(User).get(chat_id)
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
    poll = _db.session.query(Poll).get(poll_id)
    if not poll:
        raise PollNotFound
    return poll


def _get_option(poll_id, option_id):
    option = _db.session.query(PollOption).get((option_id, poll_id))
    if not option:
        raise OptionNotFound
    return option


def _get_poll_receiver_by_poll_id(chat_id, telegram_poll_id):
    poll_receiver = _db.session.query(PollReceiver).filter_by(user_id=chat_id,
                                                              telegram_poll_id=telegram_poll_id).first()
    if not poll_receiver:
        raise PollNotSent
    return poll_receiver


def get_admin(username: str) -> Admin:
    admin = _db.session.query(Admin).filter_by(username=username).first()
    if not admin:
        raise AdminNotFound
    return admin


def load_admin(admin_id):
    return Admin.query.get(int(admin_id))


def _get_poll_receiver_by_message_id(chat_id, message_id):
    poll_receiver = _db.session.query(PollReceiver).filter_by(user_id=chat_id, message_id=message_id).first()
    if not poll_receiver:
        raise PollNotSent
    return poll_receiver


def _add_answer(answer: PollAnswer):
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
    new_answer = PollAnswer(user_id=chat_id, poll_id=poll_receiver.poll_id, option_id=option_id)
    _add_answer(new_answer)
    return new_answer


def add_answer_by_message_id(chat_id, message_id, option_id):
    _get_user(chat_id)
    poll_receiver = _get_poll_receiver_by_message_id(chat_id, message_id)
    _get_option(poll_receiver.poll_id, option_id)
    new_answer = PollAnswer(user_id=chat_id, poll_id=poll_receiver.poll_id, option_id=option_id)
    _add_answer(new_answer)
    return new_answer


def _get_answer(chat_id, poll_id, answer_index):
    answer = _db.session.query(PollAnswer).filter_by(user_id=chat_id, poll_id=poll_id,
                                                     answer_index=answer_index).first()
    if not answer:
        raise AnswerNotFound
    return answer


def _add_only_poll(poll_name, question, poll_type, allows_multiple_answers, close_date, created_by):
    try:
        new_poll = Poll(poll_name=poll_name, question=question, poll_type=poll_type,
                        allows_multiple_answers=allows_multiple_answers, close_date=close_date,
                        created_by=created_by)
        _db.session.add(new_poll)
        _db.session.commit()
    except IntegrityError:
        _db.session.rollback()
        raise PollExists
    except BaseException:
        _db.session.rollback()
        raise UnknownError
    return new_poll.poll_id


def _add_option(option_id, poll_id, content, followup_poll_id):
    get_poll(poll_id)
    new_option = PollOption(option_id=option_id, poll_id=poll_id, content=content, followup_poll_id=followup_poll_id)
    try:
        _db.session.add(new_option)
        _db.session.commit()
    except BaseException:
        _db.session.rollback()
        raise UnknownError


def add_poll(poll_name, question, options, poll_type, created_by, allows_multiple_answers=False, close_date=None):
    if any(options.count(element) > 1 for element in options):
        raise OptionExists
    poll_id = _add_only_poll(poll_name=poll_name, question=question, poll_type=poll_type,
                             allows_multiple_answers=allows_multiple_answers, close_date=close_date,
                             created_by=created_by)
    for option_index, option in enumerate(options):
        content, followup = option.get('option'), option.get('poll_id')
        followup_poll_id = followup if followup != "None" else None
        _add_option(option_index, poll_id, content, followup_poll_id)
    return poll_id


def is_poll_active(poll):
    if poll.close_date:
        return poll.close_date.replace(tzinfo=None) > datetime.datetime.now().replace(tzinfo=None)
    return True


def add_poll_receiver(chat_id, poll_id, sent_by, message_id, telegram_poll_id):
    _get_user(chat_id)
    get_poll(poll_id)
    new_poll_receiver = PollReceiver(user_id=chat_id, poll_id=poll_id, message_id=message_id,
                                     telegram_poll_id=telegram_poll_id, sent_by=sent_by)
    try:
        _db.session.add(new_poll_receiver)
        _db.session.commit()
    except IntegrityError:
        _db.session.rollback()
        raise PollAlreadySent
    except BaseException:
        _db.session.rollback()
        raise UnknownError


def stop_poll(poll: Poll):
    poll.close_date = datetime.datetime.now()
    _db.session.commit()


def get_polls_data(admin_id):
    def serialize_poll(poll):
        return {
            'poll_id': poll.poll_id,
            'poll_name': poll.poll_name,
            'question': poll.question,
            'poll_type': poll.poll_type,
            'allows_multiple_answers': poll.allows_multiple_answers,
            'close_date': poll.close_date.strftime("%d-%m-%Y, %H:%M:%S") if poll.close_date else "",
            'created_by': poll.created_by,
            'poll_options': [option.content for option in poll.poll_options],
            'poll_answers': [
                {'user': receiver.user.first_name + (' ' + receiver.user.last_name if receiver.user.last_name else ''),
                 'answers': [answer.option.content for answer in receiver.poll_answers],
                 'time_answered': min([answer.time_answered for answer in receiver.poll_answers],
                                      default=None)} for receiver in poll.poll_receivers],
            'receivers': len(poll.poll_receivers),
            'answers_count': len([receiver for receiver in poll.poll_receivers if receiver.poll_answers]),
            'answers': [len(option.poll_answers) for option in poll.poll_options],
            'open': is_poll_active(poll)
        }

    admin = get_admin(admin_id)
    polls = [serialize_poll(poll) for poll in admin.polls]
    polls.sort(key=lambda x: x.get('poll_name'))
    return jsonify(polls)


def get_name(user: User):
    return user.first_name + (' ' + user.last_name if user.last_name else '')


def get_user_by_name(name: str):
    return _db.session.query(User).filter(
        func.trim(func.concat(User.first_name, ' ', User.last_name)) == name).first()


def get_poll_to_send(admin_id):
    all_users = _db.session.query(User).filter_by(is_active=True)

    def serialize_poll(poll):
        return {
            'poll_id': poll.poll_id,
            'poll_name': poll.poll_name,
            'users': [{'user': get_name(user),
                       'chat_id': user.user_id,
                       'checked': user not in [receiver.user for receiver in poll.poll_receivers],
                       'sent': user in [receiver.user for receiver in poll.poll_receivers]
                       }
                      for user in all_users],
        }

    admin = get_admin(admin_id)
    return jsonify([serialize_poll(poll) for poll in admin.polls if is_poll_active(poll)])


def delete_poll(poll_id):
    poll = get_poll(poll_id)
    _db.session.delete(poll)
    _db.session.commit()


def get_verified_admin(username, password) -> bool:
    try:
        admin = get_admin(username=username)
        return admin.verify_password(password)
    except Exception:
        return False


def get_admins():
    def serialize(admin):
        return {
            'admin': admin.username
        }

    polls = [serialize(admin) for admin in _db.session.query(Admin)]
    polls.sort(key=lambda x: x.get('admin'))
    return jsonify(polls)
