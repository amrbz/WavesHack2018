from flask import g, request
from flask_httpauth import HTTPTokenAuth
from .errors import unauthorized
import jwt

auth = HTTPTokenAuth(scheme='Bearer')


@auth.verify_token
def verify_token(token):
    if not token:
        return False
    user_id = request.headers['From']
    if not user_id:
        return False
    result = jwt.encode({'userId': user_id}, g.secret_key, algorithm='HS256') == token
    return result


@auth.error_handler
def auth_error():
    return unauthorized('Invalid credentials')


def authorized(user_id):
    is_authorized = False
    if 'Authorization' in request.headers:
        token = request.headers['Authorization'].split(None, 1)[1]
        is_authorized = jwt.encode({'userId': user_id}, g.secret_key, algorithm='HS256') == token
    return is_authorized


def generate_token(user_id):
    token = jwt.encode({'userId': user_id}, g.secret_key, algorithm='HS256')
    return token
