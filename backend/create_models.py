from config import DATABASE_URL
import psycopg2
import urllib.parse as up
import os
# from sqlacodegen.generators import CodeGenerator


SCHEMA = 'schema.sql'
COMMAND = 'flask-sqlacodegen --flask {database_url} --tables {tables} > {output_filename}'
TABLES = ['poll_answers', 'poll_options', 'poll_receivers', 'polls', 'users', 'admins']
FILENAME = 'models_new.py'


def create_tables(conn, schema):
    with conn.cursor() as cursor:
        with open(schema, "r") as schema:
            cursor.execute(schema.read())


def drop_database(conn, tables):
    command = '\n'.join([f'DROP TABLE IF EXISTS {table};' for table in tables] + ['DROP TYPE POLL_TYPE;'])
    with conn.cursor() as cursor:
        cursor.execute(command)


def reset_database():
    url = up.urlparse(DATABASE_URL)
    conn = psycopg2.connect(database=url.path[1:],
                            user=url.username,
                            password=url.password,
                            host=url.hostname,
                            )
    drop_database(conn, TABLES)
    conn.commit()
    create_tables(conn, SCHEMA)
    conn.commit()
    conn.close()


# def generate_model(host, user, password, database, outfile = None):
#     engine = create_engine(f'postgresql+psycopg2://{user}:{password}@{host}/{database}')
#     metadata = MetaData(bind=engine)
#     metadata.reflect()
#     outfile = io.open(outfile, 'w', encoding='utf-8') if outfile else sys.stdout
#     generator = CodeGenerator(metadata)
#     generator.render(outfile)
#
# if __name__ == '__main__':
#     generate_model('database.example.org', 'dbuser', 'secretpassword', 'mydatabase', 'db.py')

def create_models(install: bool):
    if install:
        os.system('pip install sqlacodegen==3.0.0b2')
    command = COMMAND.format(database_url=DATABASE_URL, tables=','.join(TABLES), output_filename=FILENAME)
    os.system(command)


if __name__ == '__main__':
    print('reset_database...')
    reset_database()
    print('create_models...')
    create_models(False)
    print('DONE')
