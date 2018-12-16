# -*- coding: utf-8 -*-

import uuid
import re
from . import api
from flask import jsonify, request, g, make_response
from errors import bad_request, conflict
from passlib.hash import pbkdf2_sha256

from authentication import auth, generate_token
from sendgrid.helpers.mail import *
from validate_email import validate_email


@api.route('/users', methods=['POST'])
def create_user():
	conn = g.mysql.connection
	cursor = conn.cursor()

	user_email = request.form['email']
	password = request.form['password']
	profile_type = request.form['profileType']

	if not user_email:
		return bad_request('Email is not provided')
	else:
		# print 'user_email', user_email
		if not validate_email(user_email):
			return bad_request('Email format is not valid')
		is_valid = validate_email(user_email, check_mx=True)
        if is_valid == False:
            return bad_request('Could not find MX records. Pleas check email domain name')

        cursor.execute("""
			SElECT COUNT(*) FROM users
			WHERE email='{email}'
		""".format(
			email=user_email
		))

        if cursor.fetchone()[0] > 0:
			return conflict('User with provided email already exists', {
				'buttonType': 'duplicateUser'
			})

	if not password:
		return bad_request('Password is not provided')

	user_id = str(uuid.uuid4())
	password_hash = pbkdf2_sha256.hash(password)
	try:
		cursor.execute("""
			INSERT INTO users(
				id,
				email,
				password,
				profile_type
			) VALUES(
				'{id}',
				'{email}',
				'{password}',
				'{profile_type}')
		""".format(
			id=user_id,
			email=user_email,
			password=password_hash,
			profile_type=profile_type
		))

		demo_page_id = None
		if profile_type == 'legal':
			demo_page_id = 'chainify-legal-demo-1'

		if profile_type == 'media':
			demo_page_id = 'chainify-media-demo-1'

		if profile_type == 'education':
			demo_page_id = 'chainify-education-demo-1'

		if demo_page_id:
			cursor.execute("""
				INSERT INTO demo_pages(
					user_id,
					page_id
				) VALUES (
					'{user_id}',
					'{page_id}')
			""".format(
				user_id=user_id,
				page_id=demo_page_id
			))

	except Exception, error:
		print 'ERROR: ', error
		return bad_request(error)
	finally:
		conn.commit()
		cursor.close()

	data = {
		'id': user_id,
		'authToken': generate_token(user_id),
		'profileType': profile_type
	}

	response = make_response(jsonify(data))
	response.status_code = 201
	return response


@api.route('/user/<user_id>', methods=['GET'])
@auth.login_required
def get_user(user_id):

	conn = g.mysql.connection
	cursor = conn.cursor()

	if not user_id:
		return bad_request('User ID is not provided')

	try:
		cursor.execute("""
			SELECT 
				u.id,
				u.email,
				u.profile_type,
				u.created
			FROM users u
			WHERE u.id='{user_id}'
		""".format(
			user_id=user_id
		))
		user = cursor.fetchone()

	except Exception, error:
		print 'ERROR: ', error
		return bad_request(error)
	finally:
		cursor.close()

	if not user:
		return '', 204

	response = make_response(jsonify({
		'id': user[0],
		'email': user[1],
		'profileType': user[2],
		'created': user[3]
	}))
	response.status_code = 200
	return response


@api.route('/user/auth', methods=['POST'])
def auth_user():

	email = request.form['email']
	password = request.form['password']

	conn = g.mysql.connection
	cursor = conn.cursor()

	if not email:
		return bad_request('Email is not provided')

	if not password:
		return bad_request('Password is not provided')

	try:
		cursor.execute("""
			SELECT 
				u.id,
				u.email,
				u.password,
				u.profile_type,
				u.created
			FROM users u
			WHERE u.email='{email}'
		""".format(
			email=email
		))
		user = cursor.fetchone()
	
	except Exception, error:
		print 'ERROR: ', error
		return bad_request(error)
	finally:
		cursor.close()

	if not user:
		return bad_request('No user with provided credentials')

	if not pbkdf2_sha256.verify(password, user[2]):
		return bad_request('No user with provided credentials')

	response = make_response(jsonify({
		'userId': user[0],
		'authToken': generate_token(user[0]),
		'profileType': user[3]
	}))

	response.status_code = 200
	return response
