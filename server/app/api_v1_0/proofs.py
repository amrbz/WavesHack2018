# -*- coding: utf-8 -*-

import uuid
from . import api
import pywaves as pw
import base64
import hashlib
import pyblake2

from flask import jsonify, request, g, make_response
from errors import bad_request, forbidden
from authentication import auth, authorized


@api.route('/proofs', methods=['POST'])
def create_proof():
	try:
		conn = g.mysql.connection
		cursor = conn.cursor()

		address = str(request.form['address'])
		age_to_prove = int(request.form['ageToProve'])
		title = 'Age is greater than {0}'.format(age_to_prove)

		cursor.execute("""
			SELECT age
			FROM users
			WHERE address='{address}'
		""".format(
			address=address
		))
		user = cursor.fetchone()

		if not user:
			return bad_request('User not found')

		print '\nPROOF\n'


		proof = '0000000000000000000000000000000027ae41e4649b934ca495991b7852b855'
		print '0', proof

		for index, i in enumerate(xrange(1 + user[0] - age_to_prove)):
			proof = hashlib.sha256(proof).hexdigest()
			print index+1, proof
			# h = pyblake2.blake2b(digest_size=32)
			# h.update(proof)
			# proof = h.hexdigest()

		print '\nENC AGE\n'

		enc_age = '0000000000000000000000000000000027ae41e4649b934ca495991b7852b855'
		for index, i in enumerate(xrange(user[0])):
			enc_age = hashlib.sha256(enc_age).hexdigest()
			print index, enc_age
			# enc_age = pyblake2.blake2b(enc_age).hexdigest()
			# h = pyblake2.blake2b(digest_size=32)
			# h.update(enc_age)
			# enc_age = h.hexdigest()

		proof_id = str(uuid.uuid4())
		cursor.execute("""
			INSERT INTO proofs (id, address, proof, title)
			VALUES('{id}', '{address}', '{proof}', '{title}')
		""".format(
			id=proof_id,
			address=address,
			title=title,
			proof=proof
		))

	except Exception, error:
		print 'ERROR: ', error
		return bad_request(error)
	finally:
		conn.commit()
		cursor.close()

	response = make_response(jsonify({
		'data': {
			'id': proof_id,
			'address': address,
			'proof': proof,
			'encAge': enc_age,
			'title': title
		}

	}))
	response.status_code = 201
	return response


@api.route('/proofs/<address>', methods=['GET'])
def get_proofs(address):
	conn = g.mysql.connection
	cursor = conn.cursor()

	try:
		cursor.execute("""
			SELECT id, address, title, proof FROM proofs
			WHERE address='{address}'
			ORDER BY created DESC 
		""".format(
			address=address
		))
		proofs = cursor.fetchall()
	except Exception, error:
		print 'ERROR: ', error
		return bad_request(error)
	finally:
		cursor.close()

	data = [{
		'id': proof[0],
		'address': proof[1],
		'title': proof[2],
		'proof': proof[3]
	} for proof in proofs]

	response = make_response(jsonify({
		'proofs': data
	}))
	response.status_code = 200
	return response
