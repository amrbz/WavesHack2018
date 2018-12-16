import { action, observable } from 'mobx';
import axios from 'axios';

class KYCStore {
  stores = null;
  constructor(stores) {
    this.stores = stores;
    this.addAccount = this.addAccount.bind(this);
    this.getAccounts = this.getAccounts.bind(this);
  }

  @observable name = '';
  @observable age = '';
  @observable residency = '';
  @observable address = '';
  @observable list = [];
  @observable showAddAccountDialog = false;
  @observable getAccountStatus = 'init';

  @action
  async addAccount() {
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

  @action
  async getAccounts() {
    this.getAccountStatus = 'fetching';
    const { notifiers } = this.stores;
    await axios
      .get(`${process.env.API_HOST}/api/v1.0/accounts`)
      .then(res => {
        if (res.status === 200) {
          this.list = res.data.accounts;
          this.getAccountStatus = 'success';
        }
      })
      .catch(e => {
        notifiers.addError(e.response.data.message);
        this.getAccountStatus = 'error';
      });
  }
}

export default KYCStore;
