# -*- coding: utf-8 -*-

import uuid
import time
from . import api
import pywaves as pw
import pywaves.crypto as crypto
import struct
import base58
import json
import base64
import hashlib
import pyblake2
from flask import jsonify, request, g, make_response
from errors import bad_request, forbidden
from authentication import auth, authorized

@api.route('/accounts', methods=['POST'])
# @auth.login_required
def create_user():
	# provider = pw.Address(privateKey=g.kyc_provider_priv_key)
	# script = 'match tx { \n' + \
	# 		 '  case _ => true\n' + \
	# 		 '}'
	# tx = address.setScript(script, txFee=1000000)
	# account = pw.Address(privateKey=g.account_priv_key)
	# user_id = str(request.form['userId'])

    address = str(request.form['address'])
    name = str(request.form['name'])
    age = int(request.form['age'])
    residency = str(request.form['residency'])

    try:
        conn = g.mysql.connection
        cursor = conn.cursor()
        account_id = str(uuid.uuid4())
        secret = '0000000000000000000000000000000027ae41e4649b934ca495991b7852b855'

        enc_age = secret
        for i in xrange(age):
            enc_age = hashlib.sha256(enc_age).hexdigest()
            # enc_age = pyblake2.blake2b(enc_age).hexdigest()
            # h = pyblake2.blake2b(digest_size=32)
            # h.update(enc_age)
            # enc_age = h.hexdigest()
            # print enc_age


        # secret = hashlib.sha256('secret').hexdigest()
        tx = smartify(enc_age)

        print '\n--> TX', tx

        cursor.execute("""
            INSERT INTO users(id, name, age, address, residency, secret)
            VALUES (
                '{id}',
                '{name}',
                '{age}',
                '{address}',
                '{residency}',
                '{secret}')
        """.format(
            id=account_id,
            name=name,
            age=age,
            address=address,
            residency=residency,
            secret=secret))

    except Exception, error:
        print 'ERROR: ', error
        return bad_request(error)
    finally:
        conn.commit()
        cursor.close()



    response = make_response(jsonify({
        'secret': secret,
        'kit': {
            'encAge': enc_age,
            'address': address,
        },
        'account': {
            'id': account_id,
            'name': name,
            'address': address,
            'age': age,
            'residency': residency
        }
    }))
    response.status_code = 201
    return response


def smartify(enc_age):
    # pw.setChain('testnet')
    pw.setNode('https://testnode1.wavesnodes.com', 'testnet')
    alice = pw.Address(privateKey=g.account_priv_key)
    kyc = pw.Address(privateKey=g.kyc_provider_priv_key)

    kyc_public_key = alice.publicKey
    kyc_private_key = alice.privateKey

    try:
        data = [{
            'type': 'string',
            'key': 'encAge',
            'value': enc_age
        }]
        timestamp = int(time.time() * 1000)
        data_object = {
            "type": 12,
            "version": 1,
            "senderPublicKey": alice.publicKey,
            "data": data,
            "fee": 500000,
            "timestamp": timestamp,
            "proofs": ['']
        }
        data_binary = b''
        for i in range(0, len(data)):
            d = data[i]
            key_bytes = crypto.str2bytes(d['key'])
            data_binary += struct.pack(">H", len(key_bytes))
            data_binary += key_bytes
            if d['type'] == 'binary':
                data_binary += b'\2'
                value_as_bytes = d['value']
                data_binary += struct.pack(">H", len(value_as_bytes))
                data_binary += crypto.str2bytes(value_as_bytes)
            elif d['type'] == 'boolean':
                if d['value']:
                    data_binary += b'\1\1'
                else:
                    data_binary += b'\1\0'
            elif d['type'] == 'integer':
                data_binary += b'\0'
                data_binary += struct.pack(">Q", d['value'])
            elif d['type'] == 'string':
                data_binary += b'\3'
                data_binary += struct.pack(">H", len(d['value']))
                data_binary += crypto.str2bytes(d['value'])
        tx_fee = (int((len(crypto.str2bytes(json.dumps(data))) + 2 + 64) / 1000.0) + 1) * 500000
        data_object['fee'] = tx_fee
        s_data = b'\x0c' + \
                 b'\1' + \
                 base58.b58decode(kyc_public_key) + \
                 struct.pack(">H", len(data)) + \
                 data_binary + \
                 struct.pack(">Q", timestamp) + \
                 struct.pack(">Q", tx_fee)
        data_object['proofs'] = [crypto.sign(kyc_private_key, s_data)]
        for entry in data_object['data']:
            if entry['type'] == 'binary':
                base_64_encoded = base64.b64encode(crypto.str2bytes(entry['value']))
                entry['value'] = 'base64:' + crypto.bytes2str(base_64_encoded)
        data_object_json = json.dumps(data_object)
        return pw.wrapper('/transactions/broadcast', data_object_json)

    except Exception, error:
        print 'ERROR: ', error
        return bad_request(error)
    finally:
        pass

    response = make_response(jsonify({

    }))
    response.status_code = 200
    return response


@api.route('/accounts', methods=['GET'])
def get_accounts():

    try:
        conn = g.mysql.connection
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, address, name, age, residency
            FROM users
            ORDER BY created DESC 
        """)
        users = cursor.fetchall()

    except Exception, error:
        print 'ERROR: ', error
        return bad_request(error)
    finally:
        cursor.close()

    response = make_response(jsonify({
        'accounts': [{
            'id': user[0],
            'address': user[1],
            'name': user[2],
            'age': user[3],
            'residency': user[4]
        } for user in users]
    }))
    response.status_code = 200
    return response
