import psycopg2
from dataclasses import dataclass

DATABASE_URL = r"postgres://ygfwwmmx:XIkJFcKU_UpbPNqWhNXL4jjWwUrVPfl2@rosie.db.elephantsql.com/ygfwwmmx"


class IntegretyError:
    pass

@dataclass(frozen=True)
class User:
    name: str
    unit_price: float
    quantity_on_hand: int = 0


@dataclass(frozen=True)
class Poll:
    name: str
    unit_price: float
    quantity_on_hand: int = 0


@dataclass(frozen=True)
class Answer:
    name: str
    unit_price: float
    quantity_on_hand: int = 0


@dataclass(frozen=True)
class Vote:
    name: str
    unit_price: float
    quantity_on_hand: int = 0


class Database:
    def __init__(self, schema="schema.sql"):
        self.conn = None
        with self as conn:
            self._create_tables(conn, schema)

    @staticmethod
    def _create_tables(conn, schema):
        with conn.cursor() as cursor:
            with open(schema, "r") as schema:
                cursor.execute(schema.read())

    def __enter__(self):
        self.conn = psycopg2.connect(database='ygfwwmmx',
                                     user='ygfwwmmx',
                                     password='XIkJFcKU_UpbPNqWhNXL4jjWwUrVPfl2',
                                     host='rosie.db.elephantsql.com',
                                     )
        return self.conn

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.conn.commit()
        self.conn.close()

    def add_User(self, user: User):
        pass

    def delete_user(self, user: User):
        pass

    def get_user(self, username: str) -> User:
        pass


if __name__ == '__main__':
    database = Database()
    with database as db:
        db.inset()
