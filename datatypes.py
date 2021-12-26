from dataclasses import dataclass
import re

CHECK_USERNAME = re.compile('[a-zA-Z0-9_-]+$')


class BadUsername(BaseException):
    def __init__(self, username):
        self.username = username


@dataclass(frozen=True)
class User:
    username: str
    telegram_chat_id: int
    telegram_first_name: str
    telegram_last_name: str = None

    def __post_init__(self):
        if not CHECK_USERNAME.match(self.username):
            raise BadUsername(self.username)


@dataclass(frozen=True)
class Poll:
    text: str


@dataclass(frozen=True)
class Answer:
    poll_id: int
    text: str


@dataclass(frozen=True)
class Vote:
    username: str
    poll_id: int
    answer_id: int
