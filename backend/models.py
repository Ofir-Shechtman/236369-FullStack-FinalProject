# coding: utf-8
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Admin(db.Model):
    __tablename__ = 'admins'

    admin_id = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    username = db.Column(db.String(30), nullable=False)
    password = db.Column(db.String(30), nullable=False)
    created_by = db.Column(db.ForeignKey('admins.admin_id'))
    time_created = db.Column(db.DateTime(True), server_default=db.FetchedValue())

    parent = db.relationship('Admin', remote_side=[admin_id], primaryjoin='Admin.created_by == Admin.admin_id',
                             backref='admins')


class PollAnswer(db.Model):
    __tablename__ = 'poll_answers'
    __table_args__ = (
        db.ForeignKeyConstraint(['option_id', 'poll_id'], ['poll_options.option_id', 'poll_options.poll_id']),
        db.ForeignKeyConstraint(['user_id', 'poll_id'], ['poll_receivers.user_id', 'poll_receivers.poll_id'])
    )

    user_id = db.Column(db.Numeric, primary_key=True, nullable=False)
    poll_id = db.Column(db.Integer, primary_key=True, nullable=False)
    option_id = db.Column(db.Integer, primary_key=True, nullable=False)
    time_answered = db.Column(db.DateTime(True), server_default=db.FetchedValue())


class PollOption(db.Model):
    __tablename__ = 'poll_options'

    option_id = db.Column(db.Integer, primary_key=True, nullable=False)
    poll_id = db.Column(db.ForeignKey('polls.poll_id'), primary_key=True, nullable=False)
    content = db.Column(db.String(300), nullable=False)

    poll = db.relationship('Poll', primaryjoin='PollOption.poll_id == Poll.poll_id', backref='poll_options')


class PollReceiver(db.Model):
    __tablename__ = 'poll_receivers'
    __table_args__ = (
        db.UniqueConstraint('user_id', 'message_id'),
    )

    user_id = db.Column(db.ForeignKey('users.user_id'), primary_key=True, nullable=False)
    poll_id = db.Column(db.ForeignKey('polls.poll_id'), primary_key=True, nullable=False)
    message_id = db.Column(db.Integer, nullable=False)
    telegram_poll_id = db.Column(db.Text)
    time_sent = db.Column(db.DateTime(True), server_default=db.FetchedValue())
    sent_by = db.Column(db.ForeignKey('admins.admin_id'), nullable=False)

    poll = db.relationship('Poll', primaryjoin='PollReceiver.poll_id == Poll.poll_id', backref='poll_receivers')
    admin = db.relationship('Admin', primaryjoin='PollReceiver.sent_by == Admin.admin_id', backref='poll_receivers')
    user = db.relationship('User', primaryjoin='PollReceiver.user_id == User.user_id', backref='poll_receivers')


class Poll(db.Model):
    __tablename__ = 'polls'

    poll_id = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    question = db.Column(db.String(300), nullable=False)
    allows_multiple_answers = db.Column(db.Boolean, nullable=False)
    close_date = db.Column(db.DateTime(True))
    created_by = db.Column(db.ForeignKey('admins.admin_id'), nullable=False)

    admin = db.relationship('Admin', primaryjoin='Poll.created_by == Admin.admin_id', backref='polls')


class User(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.Numeric, primary_key=True)
    first_name = db.Column(db.Text, nullable=False)
    last_name = db.Column(db.Text)
    is_active = db.Column(db.Boolean, nullable=False, server_default=db.FetchedValue())
    time_created = db.Column(db.DateTime(True), server_default=db.FetchedValue())
