# coding: utf-8
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class Admin(db.Model):
    __tablename__ = 'admins'
    id = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    username = db.Column(db.String(30), nullable=False)
    password_hash = db.Column(db.String(30), nullable=False)
    created_by = db.Column(db.ForeignKey('admins.id'))
    time_created = db.Column(db.DateTime(True), server_default=db.FetchedValue())

    parent = db.relationship('Admin', remote_side=[id], primaryjoin='Admin.created_by == Admin.id',
                             backref='admins')

    @property
    def password(self):
        raise AttributeError('password is not readable attribute')

    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)

    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)


class PollAnswer(db.Model):
    __tablename__ = 'poll_answers'
    __table_args__ = (
        db.ForeignKeyConstraint(('option_id', 'poll_id'), ['poll_options.option_id', 'poll_options.poll_id'],
                                ondelete='CASCADE'),
        db.ForeignKeyConstraint(('user_id', 'poll_id'), ['poll_receivers.user_id', 'poll_receivers.poll_id'],
                                ondelete='CASCADE')
    )

    user_id = db.Column(db.Numeric, primary_key=True, nullable=False)
    poll_id = db.Column(db.Integer, primary_key=True, nullable=False)
    option_id = db.Column(db.Integer, primary_key=True, nullable=False)
    time_answered = db.Column(db.DateTime(True), server_default=db.FetchedValue())

    option = db.relationship('PollOption',
                             primaryjoin='and_(PollAnswer.option_id == PollOption.option_id, PollAnswer.poll_id == PollOption.poll_id)',
                             backref='poll_answers', viewonly=True)
    user = db.relationship('PollReceiver',
                           primaryjoin='and_(PollAnswer.user_id == PollReceiver.user_id, PollAnswer.poll_id == PollReceiver.poll_id)',
                           backref='poll_answers', viewonly=True)


class PollOption(db.Model):
    __tablename__ = 'poll_options'

    option_id = db.Column(db.Integer, primary_key=True, nullable=False)
    poll_id = db.Column(db.ForeignKey('polls.poll_id', ondelete='CASCADE'), primary_key=True, nullable=False)
    content = db.Column(db.String(300), nullable=False)

    poll = db.relationship('Poll', primaryjoin='PollOption.poll_id == Poll.poll_id', backref=db.backref("poll_options", cascade="all", passive_deletes=True))


class PollReceiver(db.Model):
    __tablename__ = 'poll_receivers'
    __table_args__ = (
        db.UniqueConstraint('user_id', 'message_id'),
    )

    user_id = db.Column(db.ForeignKey('users.user_id', ondelete='CASCADE'), primary_key=True, nullable=False)
    poll_id = db.Column(db.ForeignKey('polls.poll_id', ondelete='CASCADE'), primary_key=True, nullable=False)
    message_id = db.Column(db.Integer, nullable=False)
    telegram_poll_id = db.Column(db.Text)
    time_sent = db.Column(db.DateTime(True), server_default=db.FetchedValue())
    sent_by = db.Column(db.ForeignKey('admins.id', ondelete='CASCADE'), nullable=False)

    poll = db.relationship('Poll', primaryjoin='PollReceiver.poll_id == Poll.poll_id', backref=db.backref("poll_receivers", cascade="all", passive_deletes=True))
    admin = db.relationship('Admin', primaryjoin='PollReceiver.sent_by == Admin.id', backref='poll_receivers')
    user = db.relationship('User', primaryjoin='PollReceiver.user_id == User.user_id', backref='poll_receivers')


class Poll(db.Model):
    __tablename__ = 'polls'
    __table_args__ = (
        db.UniqueConstraint('poll_name', 'created_by'),
    )

    poll_id = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    poll_name = db.Column(db.String(300), nullable=False)
    question = db.Column(db.String(300), nullable=False)
    poll_type = db.Column(db.Enum('Telegram_poll', 'Telegram_inline_keyboard', name='poll_type'), nullable=False)
    allows_multiple_answers = db.Column(db.Boolean, nullable=False)
    close_date = db.Column(db.DateTime(True))
    created_by = db.Column(db.ForeignKey('admins.id', ondelete='CASCADE'), nullable=False)

    admin = db.relationship('Admin', primaryjoin='Poll.created_by == Admin.id', backref='polls')



class User(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.Numeric, primary_key=True)
    first_name = db.Column(db.Text, nullable=False)
    last_name = db.Column(db.Text)
    is_active = db.Column(db.Boolean, nullable=False, server_default=db.FetchedValue())
    time_created = db.Column(db.DateTime(True), server_default=db.FetchedValue())
