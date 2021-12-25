import os
import urllib.parse as up
import psycopg2

DATABASE_URL = r"postgres://ygfwwmmx:XIkJFcKU_UpbPNqWhNXL4jjWwUrVPfl2@rosie.db.elephantsql.com/ygfwwmmx"

up.uses_netloc.append("postgres")
url = up.urlparse(DATABASE_URL)

conn = psycopg2.connect(database='ygfwwmmx',
                        user='ygfwwmmx',
                        password='XIkJFcKU_UpbPNqWhNXL4jjWwUrVPfl2',
                        host='rosie.db.elephantsql.com',
                        )

with conn.cursor() as cursor:
    with open("schema.sql", "r") as schema:
        cursor.execute(schema.read())
        cursor.execute("INSERT INTO users (username, telegram_chat_id, telegram_username, telegram_first_name, telegram_last_name) VALUES(%s, %s, %s, %s, %s)", ('Ofir11', 111, 'Ofir_Shechtman', 'Ofir', 'Shechtman'))
        # cursor.execute("INSERT INTO polls (text) VALUES(%s)", ('favorite color?',))
        # cursor.execute("INSERT INTO polls_choices (poll_id, text) VALUES(%s, %s)", (2, 'green'))
        # cursor.execute("INSERT INTO polls_choices (poll_id, text) VALUES(%s, %s)", (2, 'red'))

        cursor.execute("SELECT * FROM users")
        print(cursor.fetchall())



conn.commit()
conn.close()
