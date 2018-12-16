import { action, observable } from 'mobx';

class TokensaleStore {
  stores = null;
  constructor(stores) {
    this.stores = stores;
  }

  @observable yadda = 'Yadda';
}

export default TokensaleStore;
