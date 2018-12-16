# -*- coding: utf-8 -*-
import ipfsapi
import uuid
import time
import os
import magic

from . import api
from flask import jsonify, request, g, make_response
from errors import bad_request, forbidden, conflict

from authentication import auth, authorized


@api.route('/files/ipfs', methods=['POST'])
@auth.login_required
def upload_to_ipfs():
	ipfs = ipfsapi.Client(g.ipfs, 5001)
	if not ipfs:
		return bad_request('IPFS server can not be reached')

	if len(request.files) == 0:
		return bad_request('No files to upload')

	ipfs_data = None
	file_type = None
	for file_name in request.files:
		dir_id = str(uuid.uuid4())
		file_id = str(uuid.uuid4())
		dir_path = './files/' + dir_id
		os.mkdir(dir_path)
		file_path = dir_path + '/' + file_id
		request.files[file_name].save(file_path)
		file_type = magic.from_file(file_path, mime=True)
		ipfs_data = ipfs.add(file_path, only_hash=True)

		file_size = int(ipfs_data['Size'])
		if file_size > g.file_size_limit:
			os.remove(file_path)
			os.rmdir(dir_path)
			return bad_request('File size limit exceeded ({0} bytes over {1} bytes limit)'.format(file_size, g.file_size_limit))

		conn = g.mysql.connection
		cursor = conn.cursor()
		try:
			cursor.execute("""
				SELECT
					f.id, 
					f.name,
					f.size, 
					f.ipfs_hash, 
					f.tx_id, 
					f.created
				FROM files f
				WHERE ipfs_hash='{ipfs_hash}'
			""".format(
				ipfs_hash=ipfs_data['Hash']
			))
			db_file = cursor.fetchone()
		except Exception, error:
			print 'ERROR: ', error
			return bad_request(error)
		finally:
			cursor.close()		

		if db_file:
			os.remove(file_path)
			os.rmdir(dir_path)
			return conflict('''
				File has been successfully uploaded to IPFS network.
				No need to send transaction because it has been sent earlier.
				Please check the details in file passport.
			''', {
				'buttonType': 'passport',
				'file': {
					'id': db_file[0],
					'name': db_file[1],
					'size': db_file[2],
					'ipfsHash': db_file[3],
					'txid': db_file[4],
					'created': db_file[5]
				}
			})

		ipfs_data = ipfs.add(file_path)
		ipfs_data['Name'] = file_name
		os.remove(file_path)
		os.rmdir(dir_path)

	data = {
		'ipfs': ipfs_data,
		'fileType': file_type,
	}

	response = make_response(jsonify(data))
	response.status_code = 201
	return response


@api.route('/files', methods=['POST'])
@auth.login_required
def save_files():
	conn = g.mysql.connection
	cursor = conn.cursor()
	
	try:
		address = str(request.form['address'])
		page_id = str(request.form['pageId'])
		title = str(request.form['title'].encode('utf-8'))
		description = str(request.form['description'].encode('utf-8'))
		ipfs_hash = str(request.form['ipfsHash'])
		file_name = str(request.form['fileName'].encode('utf-8'))
		file_size = int(request.form['fileSize'])
		file_type = str(request.form['fileType'])
		tx_id = str(request.form['txId'])

		if not address:
			return bad_request('Page address is not provided')
		
		if not page_id:
			return bad_request('Page page id is not provided')

		cursor.execute("""
			SELECT count(*)
			FROM pages
			WHERE address='{address}'
			AND id='{page_id}'
		""".format(
			page_id=page_id,
			address=address
		))
		pages_count = cursor.fetchone()[0]

		if pages_count == 0:
			return bad_request('Page address and page ID do not match')

		if not title:
			return bad_request('Page title is not provided')

		cursor.execute("""
			SELECT u.id
			FROM pages p, users u
			WHERE p.id='{page_id}'
			AND p.user_id=u.id
		""".format(
			page_id=page_id
		))
		user_id = cursor.fetchone()
		if not user_id:
			return bad_request('No user found with provided page')
	
		file_id = 'CNFY-' + str(uuid.uuid4())
		created = int(time.time())

		cursor.execute("""
			INSERT INTO files(
				id, 
				page_id, 
				name,
				size, 
				type,
				title,
				description,
				ipfs_hash, 
				tx_id
			) VALUES (
				'{file_id}', 
				'{page_id}', 
				'{file_name}', 
				'{file_size}', 
				'{file_type}',
				'{title}',
				'{description}',
				'{ipfs_hash}', 
				'{tx_id}'
			)""".format(
				file_id=file_id,
				page_id=page_id,
				file_name=file_name.replace('\'', '\'\''),
				file_size=file_size,
				file_type=file_type,
				title=title.replace('\'', '\'\''),
				description=description.replace('\'', '\'\''),
				ipfs_hash=ipfs_hash,
				tx_id=tx_id
		))
		conn.commit()

	except Exception, error:
		print 'ERROR: ', error
		return bad_request(error)
	finally:
		cursor.close()

	data = {
		'files': [{
			'id': file_id,
			'pageId': page_id,
			'name': file_name,
			'size': file_size,
			'type': file_type,
			'title': title,
			'description': description,
			'ipfsHash': ipfs_hash,
			'txid': tx_id,
			'created': created,
			'userId': user_id[0],
		}]
	}

	response = make_response(jsonify(data))
	response.status_code = 201
	return response


@api.route('/files/<address>', methods=['GET'])
def get_files(address):
	
	conn = g.mysql.connection
	cursor = conn.cursor()

	if not address:
		return bad_request('Page address is not provided')
	else:
		cursor.execute("""
			SELECT
				id,
				address,
				title,
				description,
				is_private,
				created,
				user_id
			FROM pages
			WHERE address='{address}'
		""".format(
			address=address
		))
		page = cursor.fetchone()
		is_private, user_id = page[4], page[6]
		
		if not page:
			return bad_request('Can\'t find page by provided address')

		if is_private and not authorized(user_id):
			return forbidden()
		
	try:
		cursor.execute("""
			SELECT 
				f.id,
				f.name,
				f.size,
				f.type,
				f.ipfs_hash,
				f.tx_id,
				f.title,
				f.description,
				UNIX_TIMESTAMP(f.created),
				p.user_id
			FROM files f, pages p
			WHERE p.id=f.page_id
			AND p.address='{address}'
			ORDER BY f.created DESC
		""".format(
			address=address
		))
		files = cursor.fetchall()

	except Exception, error:
		print 'ERROR: ', error
		return bad_request(error)
	finally:
		cursor.close()

	files_data = [{
		'id': el[0],
		'name': el[1],
		'size': el[2],
		'type': el[3],
		'ipfsHash': el[4],
		'txid': el[5],
		'title': el[6],
		'description': el[7],
		'created': el[8],
		'userId': el[9]
	} for el in files]

	page_data = {
		'id': page[0],
		'address': page[1],
		'title': page[2],
		'description': page[3],
		'isPrivate': page[4],
		'created': page[5],
		'userId': page[6]
	}

	response = make_response(jsonify({
		'files': files_data,
		'page': page_data
	}))
	response.status_code = 200
	return response


@api.route('/file/<file_id>', methods=['GET'])
def get_file(file_id):

	conn = g.mysql.connection
	cursor = conn.cursor()

	if not file_id:
		return bad_request('File ID is not provided')

	try:
		cursor.execute("""
			SELECT 
				f.id,
				f.name,
				f.size,
				f.type,
				f.title,
				f.description,
				f.ipfs_hash,
				f.tx_id,
				UNIX_TIMESTAMP(f.created),
				p.id,
				p.address,
				p.title,
				p.description,
				UNIX_TIMESTAMP(p.created),
				p.is_private,
				u.id,
				UNIX_TIMESTAMP(u.created)
			FROM files f, pages p, users u
			WHERE f.id='{file_id}'
			AND f.page_id = p.id
			AND p.user_id = u.id
		""".format(
			file_id=file_id
		))
		file_data = cursor.fetchone()
		is_private = file_data[14]
		
		if is_private and not authorized(file_data[15]):
			return forbidden()

	except Exception, error:
		print 'ERROR: ', error
		return bad_request(error)
	finally:
		cursor.close()		

	if not file_data:
		return '', 204

	data = {
		'file': {
			'id': file_data[0],
			'name': file_data[1],
			'size': file_data[2],
			'type': file_data[3],
			'title': file_data[4],
			'description': file_data[5],
			'ipfsHash': file_data[6],
			'txid': file_data[7],
			'created': file_data[8],
			'userId': file_data[15]
		}, 
		'page': {
			'id': file_data[9],
			'address': file_data[10],
			'title': file_data[11],
			'description': file_data[12],
			'created': file_data[13],
			'isPrivate': file_data[14]
		},
		'user': {
			'id': file_data[15],
			'created': file_data[16]
		}
	}

	response = make_response(jsonify(data))
	response.status_code = 200
	return response


@api.route('/file/<file_id>', methods=['PUT'])
@auth.login_required
def update_file(file_id):

	conn = g.mysql.connection
	cursor = conn.cursor()

	title = str(request.form['title'].encode('utf-8'))
	description = str(request.form['description'].encode('utf-8'))

	if not file_id:
		return bad_request('File ID is not provided')

	try:
		cursor.execute("""
			UPDATE files 
			SET 
				title='{title}',
				description='{description}'
			WHERE id='{file_id}'
		""".format(
			file_id=file_id,
			title=title.replace('\'', '\'\''),
			description=description.replace('\'', '\'\'')
		))
		conn.commit()

		cursor.execute("""
			SELECT 
				f.id,
				f.name,
				f.size,
				f.type,
				f.title,
				f.description,
				f.ipfs_hash,
				f.tx_id,
				UNIX_TIMESTAMP(f.created),
				p.id,
				p.address,
				p.title,
				p.description,
				UNIX_TIMESTAMP(p.created),
				u.id,
				UNIX_TIMESTAMP(u.created)
			FROM files f
			LEFT JOIN pages p ON f.page_id=p.id
			LEFT JOIN users u ON p.user_id=u.id
			WHERE f.id='{file_id}'
			AND f.page_id = p.id
		""".format(
			file_id=file_id
		))
		file_data = cursor.fetchone()
	except Exception, error:
		print 'ERROR: ', error
		return bad_request(error)
	finally:
		cursor.close()

	if not file_data:
		return '', 204

	data = {
		'file': {
			'id': file_data[0],
			'name': file_data[1],
			'size': file_data[2],
			'type': file_data[3],
			'title': file_data[4],
			'description': file_data[5],
			'ipfsHash': file_data[6],
			'txid': file_data[7],
			'created': file_data[8],
			'userId': file_data[14]
		}, 
		'page': {
			'id': file_data[9],
			'address': file_data[10],
			'title': file_data[11],
			'description': file_data[12],
			'created': file_data[13]
		},
		'user': {
			'id': file_data[14],
			'created': file_data[15]
		}
	}

	response = make_response(jsonify(data))
	response.status_code = 200
	return response
