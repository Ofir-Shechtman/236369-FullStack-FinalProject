from sqlalchemy import Boolean, Column, DateTime, ForeignKey, ForeignKeyConstraint, Identity, Integer, Numeric, String, Text, UniqueConstraint, text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class Polls(Base):
    __tablename__ = 'polls'

    poll_id = Column(Integer, Identity(always=True, start=1, increment=1, minvalue=1, maxvalue=2147483647, cycle=False, cache=1), primary_key=True)
    question = Column(String(300), nullable=False)
    allows_multiple_answers = Column(Boolean, nullable=False)
    close_date = Column(DateTime(True))

    poll_options = relationship('PollOptions', back_populates='poll')
    poll_receivers = relationship('PollReceivers', back_populates='poll')


class Users(Base):
    __tablename__ = 'users'

    chat_id = Column(Numeric, primary_key=True)
    first_name = Column(Text, nullable=False)
    is_active = Column(Boolean, nullable=False, server_default=text('true'))
    last_name = Column(Text)
    time_created = Column(DateTime(True), server_default=text('CURRENT_TIMESTAMP'))

    poll_receivers = relationship('PollReceivers', back_populates='chat')


class PollOptions(Base):
    __tablename__ = 'poll_options'

    option_id = Column(Integer, primary_key=True, nullable=False)
    poll_id = Column(ForeignKey('polls.poll_id'), primary_key=True, nullable=False)
    content = Column(String(300), nullable=False)

    poll = relationship('Polls', back_populates='poll_options')
    poll_answers = relationship('PollAnswers', back_populates='poll_options')


class PollReceivers(Base):
    __tablename__ = 'poll_receivers'
    __table_args__ = (
        UniqueConstraint('chat_id', 'message_id'),
        UniqueConstraint('chat_id', 'telegram_poll_id')
    )

    chat_id = Column(ForeignKey('users.chat_id'), primary_key=True, nullable=False)
    poll_id = Column(ForeignKey('polls.poll_id'), primary_key=True, nullable=False)
    message_id = Column(Integer, nullable=False)
    telegram_poll_id = Column(Text, nullable=False)
    time_sent = Column(DateTime(True), server_default=text('CURRENT_TIMESTAMP'))

    chat = relationship('Users', back_populates='poll_receivers')
    poll = relationship('Polls', back_populates='poll_receivers')
    poll_answers = relationship('PollAnswers', back_populates='poll_receivers')


class PollAnswers(Base):
    __tablename__ = 'poll_answers'
    __table_args__ = (
        ForeignKeyConstraint(['chat_id', 'poll_id'], ['poll_receivers.chat_id', 'poll_receivers.poll_id']),
        ForeignKeyConstraint(['option_id', 'poll_id'], ['poll_options.option_id', 'poll_options.poll_id'])
    )

    chat_id = Column(Numeric, primary_key=True, nullable=False)
    poll_id = Column(Integer, primary_key=True, nullable=False)
    option_id = Column(Integer, primary_key=True, nullable=False)
    time_answered = Column(DateTime(True), server_default=text('CURRENT_TIMESTAMP'))

    poll_receivers = relationship('PollReceivers', back_populates='poll_answers')
    poll_options = relationship('PollOptions', back_populates='poll_answers')
