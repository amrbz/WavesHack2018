# -*- coding: utf-8 -*-
import uuid
import pywaves as pw
from . import api
from flask import jsonify, request, g, make_response
from errors import bad_request
from authentication import auth


@api.route('/faucet', methods=['POST'])
@auth.login_required
def send_tokens():
	conn = g.mysql.connection
	cursor = conn.cursor()

	root_wallet = pw.Address(privateKey=g.root_wallet_priv_key)
	page_id = str(request.form['pageId'])
	amount = float(request.form['amount'])
	user_id = str(request.form['userId'])

	if not page_id:
		return bad_request('Page id is not provided')

	if not user_id:
		return bad_request('User id is not provided')

	if not amount:
		return bad_request('Amount is not provided')

	if amount > 0.01 or amount < 0.001:
		return bad_request('Amount is not valid')

	try:
		cursor.execute("""
			SELECT SUM(amount)
			FROM faucet f
			LEFT JOIN pages p ON f.page_id = p.id
			WHERE p.user_id='{user_id}'
			AND f.created >= (now() - INTERVAL 1 DAY)
			ORDER BY f.created DESC
		""".format(
			user_id=user_id
		))
		sent_in_24_hours = cursor.fetchone()[0]
		if sent_in_24_hours and round(sent_in_24_hours + amount, 3) > g.faucet_limit:
			return bad_request('Too many requests. Please try again in ...')

		cursor.execute("""
			SELECT address FROM pages
			WHERE id='{page_id}'
		""".format(
			page_id=page_id
		))
		address = str(cursor.fetchone()[0])

		if not address:
			return bad_request('No address records found in database')

		wallet = pw.Address(address)
		asset = pw.Asset(g.asset_id)
		
		tx = root_wallet.sendAsset(
			recipient=wallet,
			asset=asset,
			amount=amount * 100000000,
			txFee=100000,
			feeAsset=asset
		)

		faucet_id = str(uuid.uuid4())
		cursor.execute("""
			INSERT INTO faucet(
				id,
				page_id,
				amount,
				tx_id
			) VALUES(
				'{id}',
				'{page_id}',
				'{amount}',
				'{tx_id}')
		""".format(
			id=faucet_id,
			page_id=page_id,
			amount=amount,
			tx_id=tx['id']
		))
		conn.commit()

	except Exception, error:
		print 'ERROR: ', error
		return bad_request(error)
	finally:
		cursor.close()
		
	data = {
		'message': 'Transaction has been sent. It may take several seconds before the balance will be updated.',
		'data': {
			'buttonType': 'tx',
			'tx': tx
		}
	}

	response = make_response(jsonify(data))
	response.status_code = 201
	return response


@api.route('/faucet/<user_id>', methods=['GET'])
@auth.login_required
def get_limit(user_id):
	conn = g.mysql.connection
	cursor = conn.cursor()
	try:
		cursor.execute("""
			SELECT
				f.amount,
				ABS(UNIX_TIMESTAMP(now() - INTERVAL 1 DAY) - UNIX_TIMESTAMP(f.created)) as timeLimit,
				f.tx_id
			FROM faucet f
			LEFT JOIN pages p ON f.page_id = p.id
			WHERE p.user_id='{user_id}'
			AND f.created >= (now() - INTERVAL 1 DAY)
			ORDER BY f.created DESC
		""".format(
			user_id=user_id
		))
		records = cursor.fetchall()

	except Exception, error:
		print 'ERROR: ', error
		return bad_request(error)
	finally:
		cursor.close()

	sent_in_24_hours = 0
	for record in records:
		sent_in_24_hours += record[0]

	limit = abs(round(g.faucet_limit - sent_in_24_hours, 3))

	data = {
		'faucetLimit': limit,
		'requests': [{
			'amount': el[0],
			'timeLimit': el[1],
			'txid': el[2]
		} for el in records]
	}

	response = make_response(jsonify(data))
	response.status_code = 200
	return response
