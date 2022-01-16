from config import DATABASE_URL
import psycopg2
import urllib.parse as up
import os
# from sqlacodegen.generators import CodeGenerator


SCHEMA = 'schema.sql'
INSERT = 'insert.sql'
COMMAND = 'flask-sqlacodegen --flask {database_url} --tables {tables} > {output_filename}'
TABLES = ['poll_answers', 'poll_options', 'poll_receivers', 'polls', 'users', 'admins']
FILENAME = 'models_new.py'


def _create_tables(conn, schema):
    with conn.cursor() as cursor:
        with open(schema, "r") as schema:
            cursor.execute(schema.read())


def _drop_database(conn, tables):
    command = '\n'.join([f'DROP TABLE IF EXISTS {table};' for table in tables] + ['DROP TYPE IF EXISTS POLL_TYPE;'])
    with conn.cursor() as cursor:
        cursor.execute(command)


def _reset_database():
    url = up.urlparse(DATABASE_URL)
    conn = psycopg2.connect(database=url.path[1:],
                            user=url.username,
                            password=url.password,
                            host=url.hostname,
                            )
    _drop_database(conn, TABLES)
    conn.commit()
    _create_tables(conn, SCHEMA)
    conn.commit()
    conn.close()


def _insert_data(insert):
    url = up.urlparse(DATABASE_URL)
    conn = psycopg2.connect(database=url.path[1:],
                            user=url.username,
                            password=url.password,
                            host=url.hostname,
                            )
    with conn.cursor() as cursor:
        with open(insert, "r") as schema:
            cursor.execute(schema.read())
    conn.commit()
    conn.close()


def _create_models(install: bool):
    if install:
        os.system('pip install sqlacodegen==3.0.0b2')
    command = COMMAND.format(database_url=DATABASE_URL, tables=','.join(TABLES), output_filename=FILENAME)
    os.system(command)

def create_database():
    url = up.urlparse(DATABASE_URL)
    conn = psycopg2.connect(database=url.path[1:],
                            user=url.username,
                            password=url.password,
                            host=url.hostname,
                            )
    _create_tables(conn, SCHEMA)
    conn.commit()
    conn.close()

if __name__ == '__main__':
    print('reset_database...')
    _reset_database()
    _insert_data(INSERT)
    print('create_models...')
    # _create_models(False)
    print('DONE')
