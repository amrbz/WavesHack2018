const { order } = require('waves-transactions')
const { broadcast } = require("waves-transactions/general");
const { createOrderPair, TESTNET_DATA } = require('@waves/assets-pairs-order');

const seed = 'cycle time essence siege fall rack theme coconut helmet animal exact sister brand visual upgrade'
const tokenId = 'Ezmc5iyssHRF9qgCoa6h8ejPG4JFD17qEGZdPUBU1MqL';

const pair = createOrderPair(TESTNET_DATA, 'tokenId', 'WAVES');

const params = {
  amount: 100000000, //1 waves
  price: 1, // for 1 SEC token
  matcherPublicKey: '7kPFrHDiGw1rCm7LPszuECwWYL3dMf6iMifLRDJQZMzy',
  orderType: 'buy',
  amountAsset: pair[0],
  priceAsset: pair[1]
}


const createOrder = () => {
  const signedOrder = order(params, seed);
  broadcast(signedOrder, 'https://testnodes.wavesnodes.com/').then(res => console.log(res)).catch(e=> console.log(e))
}
