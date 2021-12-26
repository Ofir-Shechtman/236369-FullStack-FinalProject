import psycopg2

import urllib.parse as up
from datatypes import User, Poll, Answer, Vote

DATABASE_URL = r"postgres://ygfwwmmx:XIkJFcKU_UpbPNqWhNXL4jjWwUrVPfl2@rosie.db.elephantsql.com/ygfwwmmx"
url = up.urlparse(DATABASE_URL)


class IntegretyError:
    pass



class Database:
    def __init__(self, database_url=DATABASE_URL, schema="schema.sql"):
        self.url = up.urlparse(database_url)
        self._conn = psycopg2.connect(database=url.path[1:],
                                      user=url.username,
                                      password=url.password,
                                      host=url.hostname,
                                      )

        self._create_tables(schema)

    def close(self):
        self._conn.close()

    def _create_tables(self, schema):
        with self._conn.cursor() as cursor:
            with open(schema, "r") as schema:
                cursor.execute(schema.read())

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self._conn.commit()

    def drop_database(self):
        tables = ['votes', 'answers', 'polls', 'users']
        command = '\n'.join([f'DROP TABLE {table};' for table in tables])
        with self._conn.cursor() as cursor:
            cursor.execute(command)

    def add_user(self, user: User) -> str:
        with self._conn.cursor() as cur:
            try:
                cur.execute(
                    "INSERT INTO users (username, telegram_chat_id, telegram_first_name, telegram_last_name) VALUES(%s, %s, %s, %s)",
                    (user.username, user.telegram_chat_id, user.telegram_first_name, user.telegram_last_name))
                return user.username
            except BaseException as e:
                cur.execute("ROLLBACK")

    def delete_user(self, user: User) -> bool:
        with self._conn.cursor() as cur:
            cur.execute("DELETE FROM users WHERE username = %s and telegram_chat_id = %s", (user.username, user.telegram_chat_id))
            return cur.rowcount > 0

    def get_user(self, username: str) -> User:
        with self._conn.cursor() as cur:
            cur.execute(
                "SELECT username, telegram_chat_id, telegram_first_name, telegram_last_name FROM users WHERE username = %s",
                (username,))
            row = cur.fetchone()
            if row:
                return User(*row)


if __name__ == '__main__':
    database = Database()
    with database as db:
        db.add_user(User('ofir11', 122, "Ofir", "Shechtman"))
        print(db.get_user('ofir11'))
    with database as db:
        db.add_user(User('ofir11', 122, "Ofir", "Shechtman"))
        print(db.get_user('ofir11'))
        # print(db.delete_user('ofir11'))
        # print(db.get_user('ofir11'))
        # print(db.delete_user('ofir11'))
        # print(db.get_user('ofir11'))
    # database.drop_database()
