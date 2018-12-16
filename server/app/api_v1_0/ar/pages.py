# -*- coding: utf-8 -*-

import uuid
from . import api
from flask import jsonify, request, g, make_response
from errors import bad_request, forbidden
from authentication import auth, authorized


@api.route('/pages', methods=['POST'])
@auth.login_required
def create_page():
	conn = g.mysql.connection
	cursor = conn.cursor()

	user_id = str(request.form['userId'])
	address = str(request.form['address'])
	title = str(request.form['title'].encode('utf-8'))
	description = str(request.form['description'].encode('utf-8'))
	is_private = 1 if request.form['isPrivate'] == 'true' else 0

	if not user_id:
		return bad_request('User ID is not provided')
	
	if not address:
		return bad_request('Address must not be empty')
	else:
		cursor.execute("""
			SELECT COUNT(*) FROM pages
			WHERE address='{address}'
		""".format(
			address=address
		))
		count = cursor.fetchone()[0]
		if count > 0:
			return bad_request('Provided address is already added')

	if not title:
		return bad_request('Title must not be empty')
	else:
		if len(title) > g.page_title_limit:
			return bad_request('Page title length limit ({0} charachters) is exceeded'.format(g.page_title_limit))

		cursor.execute("""
			SELECT COUNT(*) FROM pages
			WHERE title='{title}'
		""".format(
			title=title
		))
		count = cursor.fetchone()[0]
		if count > 0:
			return bad_request('Title must be unique')

	if len(description) > g.page_descr_limit:
		return bad_request('Page description length limit ({0} charachters) is exceeded'.format(g.page_descr_limit))

	page_id = str(uuid.uuid4())
	try:
		cursor.execute("""
			INSERT INTO pages (
				id,
				user_id,
				address,
				title,
				description,
				is_private
			) VALUES(
				'{id}',
				'{user_id}',
				'{address}',
				'{title}',
				'{description}',
				'{is_private}')
		""".format(
			id=page_id,
			user_id=user_id,
			address=address,
			title=title.replace('\'', '\'\''),
			description=description.replace('\'', '\'\''),
			is_private=is_private
		))
		conn.commit()

	except Exception, error:
		print 'ERROR: ', error
		return bad_request(error)
	finally:
		cursor.close()

	data = {
		'id': page_id,
		'userId': user_id,
		'address': address,
		'title': title,
		'description': description,
		'balance': 0,
		'isPrivate': True if is_private == 1 else False
	}

	response = make_response(jsonify(data))
	response.status_code = 201
	return response


@api.route('/pages/<user_id>', methods=['GET'])
def get_pages(user_id):

	conn = g.mysql.connection
	cursor = conn.cursor()

	if not user_id:
		return bad_request('User ID is not provided')

	try:
		cursor.execute("""
			SELECT 
				p.id,
				p.address,
				p.title,
				p.description,
				p.is_private,
				p.created
			FROM pages p, users u
			WHERE p.user_id='{user_id}'
			AND p.user_id = u.id
			ORDER BY p.created DESC
		""".format(
			user_id=user_id
		))
		pages = cursor.fetchall()

	except Exception, error:
		print 'ERROR: ', error
		return bad_request(error)
	finally:
		cursor.close()

	if len(pages) == 0:
		return '', 204

	data = [{
		'id': el[0],
		'address': el[1],
		'title': el[2],
		'description': el[3],
		'isPrivate': True if el[4] == 1 else False,
		'created': el[5]
	} for el in pages]

	response = make_response(jsonify(data))
	response.status_code = 200
	return response


@api.route('/demo_pages/<user_id>', methods=['GET'])
def get_demo_pages(user_id):

	conn = g.mysql.connection
	cursor = conn.cursor()

	if not user_id:
		return bad_request('User ID is not provided')

	try:
		cursor.execute("""
			SELECT 
				p.id,
				p.address,
				p.title,
				p.description,
				p.is_private,
				p.created
			FROM demo_pages dp, pages p
			WHERE dp.user_id='{user_id}'
			AND dp.page_id = p.id
			ORDER BY p.created DESC
		""".format(
			user_id=user_id
		))
		pages = cursor.fetchall()

	except Exception, error:
		print 'ERROR: ', error
		return bad_request(error)
	finally:
		cursor.close()

	if len(pages) == 0:
		return '', 204

	data = [{
		'id': el[0],
		'address': el[1],
		'title': el[2],
		'description': el[3],
		'isPrivate': True if el[4] == 1 else False,
		'created': el[5]
	} for el in pages]

	response = make_response(jsonify(data))
	response.status_code = 200
	return response


@api.route('/page/<page_id>', methods=['GET'])
def get_page(page_id):
	conn = g.mysql.connection
	cursor = conn.cursor()

	if not page_id:
		return bad_request('Page ID is not provided')

	try:
		cursor.execute("""
			SELECT 
				p.id,
				p.address,
				p.title,
				p.description,
				p.is_private,
				p.created,
				p.user_id
			FROM pages p
			WHERE id='{page_id}'
		""".format(
			page_id=page_id
		))
		page = cursor.fetchone()
		is_private, user_id = page[4], page[6]

		if is_private and not authorized(user_id):
			return forbidden()

	except Exception, error:
		print 'ERROR: ', error
		return bad_request(error)
	finally:
		cursor.close()

	if not page:
		return '', 204

	data = {
		'id': page[0],
		'address': page[1],
		'title': page[2],
		'description': page[3],
		'isPrivate': True if page[4] == 1 else False,
		'created': page[5]
	}

	response = make_response(jsonify(data))
	response.status_code = 200
	return response


@api.route('/page/<page_id>', methods=['PUT'])
@auth.login_required
def update_page(page_id):
	conn = g.mysql.connection
	cursor = conn.cursor()

	title = str(request.form['title'].encode('utf-8'))
	description = str(request.form['description'].encode('utf-8'))
	is_private = 1 if request.form['isPrivate'] == 'true' else 0

	if not page_id:
		return bad_request('Page ID is not provided')

	if not title:
		return bad_request('Title must not be empty')
	else:
		if len(title) > g.page_title_limit:
			return bad_request('Page title length limit ({0} charachters) is exceeded'.format(g.page_title_limit))

		cursor.execute("""
			SELECT COUNT(*) FROM pages
			WHERE title='{title}'
			AND id <> '{page_id}'
		""".format(
			title=title,
			page_id=page_id
		))
		count = cursor.fetchone()[0]
		if count > 0:
			return bad_request('Title must be unique')

	if len(description) > g.page_descr_limit:
		return bad_request('Page description length limit ({0} charachters) is exceeded'.format(g.page_descr_limit))

	try:
		cursor.execute("""
			UPDATE pages
			SET 
				title='{title}',
				description='{description}',
				is_private='{is_private}'
			WHERE id='{page_id}'
		""".format(
			title=title.replace('\'', '\'\''),
			description=description.replace('\'', '\'\''),
			is_private=is_private,
			page_id=page_id
		))
		conn.commit()

		cursor.execute("""
			SELECT 
				id,
				address,
				title,
				description,
				is_private,
				created
			FROM pages 
			WHERE id='{page_id}'
		""".format(
			page_id=page_id
		))
		page = cursor.fetchone()
	except Exception, error:
		print 'ERROR: ', error
		return bad_request(error)
	finally:
		cursor.close()

	if not page:
		return '', 204

	data = {
		'id': page[0],
		'address': page[1],
		'title': page[2],
		'description': page[3],
		'isPrivate': True if page[4] == 1 else False,
		'created': page[5]
	}

	response = make_response(jsonify(data))
	response.status_code = 200
	return response


@api.route('/demo_data/<user_id>', methods=['DELETE'])
@auth.login_required
def demo_data(user_id):
	conn = g.mysql.connection
	cursor = conn.cursor()

	if not user_id:
		return bad_request('User ID is not provided')

	try:
		cursor.execute("""
			DELETE FROM demo_pages
			WHERE user_id='{user_id}'
		""".format(
			user_id=user_id
		))

		cursor.execute("""
			UPDATE users SET profile_type='default'
			WHERE id='{user_id}'
		""".format(
			user_id=user_id
		))
	except Exception, error:
		print 'ERROR: ', error
		return bad_request(error)
	finally:
		conn.commit()
		cursor.close()

	return '', 204
