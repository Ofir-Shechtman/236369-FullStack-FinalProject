from sqlalchemy import Column, DateTime, ForeignKey, Identity, Integer, Text, text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class Polls(Base):
    __tablename__ = 'polls'

    id = Column(Integer, Identity(always=True, start=1, increment=1, minvalue=1, maxvalue=2147483647, cycle=False, cache=1), primary_key=True)
    content = Column(Text, nullable=False)
    time_created = Column(DateTime(True), server_default=text('CURRENT_TIMESTAMP'))

    answers = relationship('Answers', back_populates='poll')
    votes = relationship('Votes', back_populates='poll')


class Users(Base):
    __tablename__ = 'users'

    chat_id = Column(Integer, primary_key=True)
    first_name = Column(Text, nullable=False)
    last_name = Column(Text)
    time_created = Column(DateTime(True), server_default=text('CURRENT_TIMESTAMP'))

    votes = relationship('Votes', back_populates='chat')


class Answers(Base):
    __tablename__ = 'answers'

    id = Column(Integer, Identity(always=True, start=1, increment=1, minvalue=1, maxvalue=2147483647, cycle=False, cache=1), primary_key=True)
    poll_id = Column(ForeignKey('polls.id'), nullable=False)
    content = Column(Text, nullable=False)
    time_created = Column(DateTime(True), server_default=text('CURRENT_TIMESTAMP'))

    poll = relationship('Polls', back_populates='answers')
    votes = relationship('Votes', back_populates='answer')


class Votes(Base):
    __tablename__ = 'votes'

    chat_id = Column(ForeignKey('users.chat_id'), primary_key=True, nullable=False)
    poll_id = Column(ForeignKey('polls.id'), primary_key=True, nullable=False)
    answer_id = Column(ForeignKey('answers.id'), nullable=False)
    time_created = Column(DateTime(True), server_default=text('CURRENT_TIMESTAMP'))

    answer = relationship('Answers', back_populates='votes')
    chat = relationship('Users', back_populates='votes')
    poll = relationship('Polls', back_populates='votes')
