# -*- coding: utf-8 -*-

import uuid
from . import api
import pywaves as pw
import base64
import hashlib
from flask import jsonify, request, g, make_response
from errors import bad_request, forbidden
from authentication import auth, authorized


@api.route('/matcher', methods=['POST'])
def sell_order():
	pw.setNode('https://testnode1.wavesnodes.com', 'testnet')
	try:
		alice = pw.Address(privateKey=g.account_priv_key)
		WAVES = pw.Asset('WAVES')
		STO = pw.Asset('Ezmc5iyssHRF9qgCoa6h8ejPG4JFD17qEGZdPUBU1MqL')
		WAVES_STO = pw.AssetPair(WAVES, STO)
		myOrder = alice.sell(assetPair=WAVES_STO, amount=1e8, price=1)

		print '--> myOrder', myOrder
	except Exception, error:
		print 'ERROR: ', error
		return bad_request(error)
	finally:
		pass
		# conn.commit()
		# cursor.close()

	response = make_response(jsonify({

	}))
	response.status_code = 200
	return response
