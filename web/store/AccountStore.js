import { action, observable } from 'mobx';
import { data, setScript, broadcast } from 'waves-transactions';
import { compile } from '@waves/ride-js';
import btoa from 'btoa';
import { publicKey } from 'waves-crypto';

class Account {
  stores = null;
  constructor(stores) {
    this.stores = stores;
  }

  @observable seed = 'eyebrow arch slight obvious typical cross cricket scan hundred fun remove choice young worth pride';
  @observable kycPublicKey = 'HtMUreD2WD1BYXE1idEnZSvBBS4iur2pjr48oRzxoUZW';
  @observable proof = '';
  @observable activeStep = 0;
  @observable isSmart = false;

  @action
  becomeSmart() {
    const { notifiers } = this.stores;
    const contract = `
      let KYCPublicKey = base58'${this.kycPublicKey}'
      match tx {
          case tx : DataTransaction =>
              sigVerify(tx.bodyBytes, tx.proofs[0], KYCPublicKey)
              || sigVerify(tx.bodyBytes, tx.proofs[0], tx.senderPublicKey)

          case _ => sigVerify(tx.bodyBytes, tx.proofs[0], tx.senderPublicKey)
      }
    `;

    const r = compile(contract);
    if (r.error) {
      throw new Error(r.error);
    }
    const binstr = Array.prototype.map
      .call(new Uint8Array(r.result), ch => String.fromCharCode(ch))
      .join('');

    const compiledContract = btoa(binstr);
    const tx = setScript(
      {
        script: compiledContract,
        fee: 1400000,
        chainId: 'T',
      },
      this.seed,
    );
    broadcast(tx, 'https://testnodes.wavesnodes.com/')
      .then(res => {
        console.log('SMART', res);
        if (res.id) {
          this.isSmart = true;
          notifiers.addInfoWithData('You have been updated your account', {
            buttonType: 'tx',
            tx: {
              id: res.id,
            },
          });
        }
      })
      .catch(e => console.log(e));
  }

  @action
  async requestProof() {
    const { notifiers } = this.stores;
    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('age', this.age);
    formData.append('address', this.address);
    formData.append('residency', this.residency);

    const formConfig = {};

    await axios
      .post(`${process.env.API_HOST}/api/v1.0/accounts`, formData, formConfig)
      .then(res => {
        if (res.status === 201) {
          notifiers.addSuccess('Account successfully created');

          const arr =
            this.list.length === 0
              ? [res.data.account]
              : [res.data.account].concat(this.list);

          this.list = arr;
          this.name = '';
          this.age = '';
          this.residency = '';
          this.address = '';
          this.showAddAccountDialog = false;
        }
      })
      .catch(e => {
        notifiers.addError(e.response.data.message);
      });
  }
}

export default Account;
