from flask import Flask
from flask import request
from config import BOT_TOKEN, URL, DATABASE_URL
from urllib.parse import urlparse
from database import init, add_user, delete_user, DBUserExists, DBUserNotFound

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db = init(app)


@app.route('/')
def index():
    return '<h1>Hello World</h1>'


@app.route(f'/{BOT_TOKEN}', methods=['POST'])
def respond():
    method = request.values['method']
    if method == 'register':
        last_name = request.values['last_name'] if 'last_name' in request.values.keys() else None
        try:
            add_user(chat_id=int(request.values['chat_id']),
                     first_name=request.values['first_name'],
                     last_name=last_name)
        except DBUserExists as e:
            return {"status": False, "reason": type(e).__name__}
    elif method == 'remove':
        try:
            delete_user(chat_id=int(request.values['chat_id']))
        except DBUserNotFound as e:
            return {"status": False, "reason": type(e).__name__}
    return {"status": True}


if __name__ == '__main__':
    url = urlparse(URL)
    app.run(host=url.hostname, port=url.port, debug=True)
