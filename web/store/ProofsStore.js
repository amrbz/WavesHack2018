import { action, observable, toJS } from 'mobx';
import axios from 'axios';
import * as WavesAPI from 'waves-api';
import { data, broadcast } from 'waves-transactions';

const Waves = WavesAPI.create(WavesAPI.TESTNET_CONFIG);

class ProofsStore {
  stores = null;
  constructor(stores) {
    this.stores = stores;
    this.getProofs = this.getProofs.bind(this);
    this.createProof = this.createProof.bind(this);
  }

  @observable list = [];
  @observable getProofsStatus = 'init';
  @observable ageToProve = '18';
  @observable showAddProofDialog = false;

  @action
  async getProofs() {
    this.getProofsStatus = 'fetching';
    const { notifiers, account } = this.stores;
    const { address } = Waves.Seed.fromExistingPhrase(account.seed);
    await axios
      .get(`${process.env.API_HOST}/api/v1.0/proofs/${address}`)
      .then(res => {
        if (res.status === 200) {
          this.list = res.data.proofs;
          this.getProofsStatus = 'success';
        }
      })
      .catch(e => {
        notifiers.addError(e.response.data.message);
        this.getProofsStatus = 'error';
      });
  }

  @action
  async createProof() {
    const { notifiers } = this.stores;
    const { account } = this.stores;
    const alice = Waves.Seed.fromExistingPhrase(account.seed);
    var ByteBuffer = require("bytebuffer");

    const formData = new FormData();
    formData.append('ageToProve', this.ageToProve);
    formData.append('address', alice.address);

    const formConfig = {};

    await axios
      .post(`${process.env.API_HOST}/api/v1.0/proofs`, formData, formConfig)
      .then(res => {
        const bbProof = ByteBuffer.fromHex(res.data.data.proof);
        const bbEncAge = ByteBuffer.fromHex(res.data.data.encAge);

        if (res.status === 201) {
          const arr =
            this.list.length === 0
              ? [res.data.data]
              : [res.data.data].concat(toJS(this.list));
          this.list = arr;

          const params = {
            data: [
              { key: 'proof', value: bbProof.view },
              { key: 'encAge', value: bbEncAge.view },
            ],
            senderPublicKey: alice.keyPair.publicKey,
            fee: 500000,
          };
          const tx = data(params, alice.phrase);
          broadcast(tx, 'https://testnodes.wavesnodes.com/')
            .then(proof => {
              notifiers.addInfoWithData('Proof was added', {
                buttonType: 'tx',
                tx: {
                  id: proof.id,
                },
              });
            })
            .catch(e => {
              notifiers.addError(e.message);
            });
        }
      })
      .catch(e => {
        notifiers.addError(e.response.data.message);
      });
  }
}

export default ProofsStore;
