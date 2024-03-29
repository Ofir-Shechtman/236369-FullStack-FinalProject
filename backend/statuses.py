from flask import Response
from typing import Literal

Method = Literal['register', 'remove']
ReturnMessage = Literal['SUCCESS', 'DBUserExists', 'DBUserNotFound', 'Unknown']


class Status(Response):
    def __init__(self, simple: ReturnMessage):
        super().__init__(simple, 200)


class StatusInline(Response):
    def __init__(self, data):
        super().__init__(data, 200)