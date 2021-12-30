from sqlalchemy import Boolean, Column, DateTime, ForeignKey, ForeignKeyConstraint, Integer, Numeric, String, Text, text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class Polls(Base):
    __tablename__ = 'polls'

    poll_id = Column(Text, primary_key=True)
    question = Column(String(300), nullable=False)
    message_id = Column(Integer, nullable=False)
    allows_multiple_answers = Column(Boolean, nullable=False)
    open_date = Column(DateTime(True), nullable=False)
    close_date = Column(DateTime(True))

    poll_option = relationship('PollOption', back_populates='poll')
    poll_answer = relationship('PollAnswer', back_populates='poll')


class Users(Base):
    __tablename__ = 'users'

    chat_id = Column(Numeric, primary_key=True)
    first_name = Column(Text, nullable=False)
    is_active = Column(Boolean, nullable=False, server_default=text('true'))
    last_name = Column(Text)
    time_created = Column(DateTime(True), server_default=text('CURRENT_TIMESTAMP'))

    poll_answer = relationship('PollAnswer', back_populates='chat')


class PollOption(Base):
    __tablename__ = 'poll_option'

    option_id = Column(Integer, primary_key=True, nullable=False)
    poll_id = Column(ForeignKey('polls.poll_id'), primary_key=True, nullable=False)
    content = Column(String(300), nullable=False)

    poll = relationship('Polls', back_populates='poll_option')
    poll_answer = relationship('PollAnswer', back_populates='poll_option')


class PollAnswer(Base):
    __tablename__ = 'poll_answer'
    __table_args__ = (
        ForeignKeyConstraint(['option_id', 'poll_id'], ['poll_option.option_id', 'poll_option.poll_id']),
    )

    chat_id = Column(ForeignKey('users.chat_id'), primary_key=True, nullable=False)
    poll_id = Column(ForeignKey('polls.poll_id'), primary_key=True, nullable=False)
    option_id = Column(Integer, primary_key=True, nullable=False)
    time_answered = Column(DateTime(True), server_default=text('CURRENT_TIMESTAMP'))

    chat = relationship('Users', back_populates='poll_answer')
    poll_option = relationship('PollOption', back_populates='poll_answer')
    poll = relationship('Polls', back_populates='poll_answer')
