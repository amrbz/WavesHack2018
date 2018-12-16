import { action, observable } from 'mobx';

class IndexStore {
  stores = null;
  constructor(stores) {
    this.stores = stores;
  }

  @observable yadda = 'Yadda';
}

export default IndexStore;
