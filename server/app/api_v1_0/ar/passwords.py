# -*- coding: utf-8 -*-

import uuid
from . import api
from flask import jsonify, request, g, make_response
from errors import bad_request
from passlib.hash import pbkdf2_sha256

from authentication import auth
from sendgrid.helpers.mail import *

@api.route('/password/update', methods=['PUT'])
@auth.login_required
def update_pass():
    conn = g.mysql.connection
    cursor = conn.cursor()

    user_id = request.form['userId']
    old_password = request.form['oldPassword']
    new_password = request.form['newPassword']

    try:
        cursor.execute("""
			SELECT password
			FROM users
			WHERE id='{user_id}'
		""".format(
            user_id=user_id
        ))
        saved_user = cursor.fetchone()

        if not saved_user:
            return bad_request('User not found')

        old_hash = saved_user[0]

        if pbkdf2_sha256.verify(old_password, old_hash):
            cursor.execute("""
				UPDATE users u
				SET password='{new_password}'
				WHERE u.id='{user_id}'
			""".format(
                user_id=user_id,
                new_password=new_password
            ))
            conn.commit()
        else:
            return bad_request('Old password does not match')

    except Exception, error:
        print 'ERROR: ', error
        return bad_request(error)
    finally:
        cursor.close()

    response = make_response(jsonify({
        'id': user_id
    }))
    response.status_code = 200
    return response


@api.route('/password/recover/<user_email>', methods=['POST'])
def create_password_recover(user_email):
    if not user_email:
        return bad_request('Email is not provided')

    conn = g.mysql.connection
    cursor = conn.cursor()

    try:
        cursor.execute("""
			SELECT id
			FROM users
			WHERE email='{email}'
		""".format(
            email=user_email
        ))
        user = cursor.fetchone()

        if not user:
            return bad_request('Could not find the account with provided email address')

        recovery_id = str(uuid.uuid4())
        email_body = """
			<h4>Password recovery request</h4>
			<p>
				You have received this email because requested a password update at&nbsp;
				<a href="https://chainify.org" target="_blank">chainify.org</a>
			</p>
			<p>In order to proceed please clink the link below and follow further instructions</p>
			<p>
				<a href="https://chainify.org/recover/{recovery_id}">
					https://chainify.org/recover/{recovery_id}
				</a>
			</p>
			<p>&nbsp;</p>
			<p>Regards</p>
		""".format(
            recovery_id=recovery_id
        )

        from_email = Email("noreply@chainify.org")
        to_email = Email(user_email)
        subject = "Password recovery"
        content = Content("text/html", email_body)
        mail = Mail(from_email, subject, to_email, content)
        email_response = g.email.client.mail.send.post(request_body=mail.get())

        cursor.execute("""
            INSERT INTO password_recovery(
                id,
                user_id,
                email_status
            ) VALUES(
                '{recovery_id}',
                '{user_id}',
                '{email_status}')
        """.format(
            recovery_id=recovery_id,
            user_id=user[0],
            email_status=email_response.status_code
        ))

    except Exception, error:
        print 'ERROR: ', error
        return bad_request(error)
    finally:
        conn.commit()
        cursor.close()

    response = make_response(jsonify({
        'statusCode': email_response.status_code,
        'recoveryId': recovery_id,
        'userId': user[0]
    }))
    response.status_code = 201
    return response


@api.route('/password/recover/<recovery_id>', methods=['GET'])
def get_password_recover(recovery_id):

    if not recovery_id:
        return bad_request('Recovery id is not provided')

    conn = g.mysql.connection
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT recovery_id, user_id
            FROM password_recovery
            WHERE id='{recovery_id}'
        """.format(
            recovery_id=recovery_id
        ))
        recovery = cursor.fetchone()

        if not recovery:
            return '', 204

    except Exception, error:
        print 'ERROR: ', error
        return bad_request(error)
    finally:
        cursor.close()

    response = make_response(jsonify({
        'id': recovery[0],
        'userId': recovery[1]
    }))
    response.status_code = 200
    return response


@api.route('/password/recover/<recovery_id>', methods=['PUT'])
def update_password_recover(recovery_id):
    password = request.form['newPassword']

    if not recovery_id:
        return bad_request('Recovery id is not provided')

    if not password:
        return bad_request('Password is not provided')

    conn = g.mysql.connection
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id, user_id
            FROM password_recovery
            WHERE id='{recovery_id}'
        """.format(
            recovery_id=recovery_id
        ))
        recovery = cursor.fetchone()

        if not recovery:
            return bad_request('Recovery session is not found')

        pbkdf2_password = pbkdf2_sha256.hash(password)
        cursor.execute("""
            UPDATE users u SET password='{password}'
            WHERE u.id='{user_id}'
        """.format(
            user_id=recovery[1],
            password=pbkdf2_password
        ))

        cursor.execute("""
            UPDATE recovery_update SET recovered=1
            WHERE id='{recovery_id}'
        """.format(
            recovery_id=recovery_id
        ))

    except Exception, error:
        print 'ERROR: ', error
        return bad_request(error)
    finally:
        conn.commit()
        cursor.close()

    response = make_response(jsonify({
        'id': recovery[0]
    }))
    response.status_code = 200
    return response
