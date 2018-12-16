import { action, observable } from 'mobx';

class Notifiers {
  stores = null;
  constructor(stores) {
    this.stores = stores;
    this.addError = this.addError.bind(this);
    this.addInfoWithData = this.addInfoWithData.bind(this);
  }

  // @observable errors = [];
  @observable info = null;
  @observable list = [];

  // @action
  // addInfo(message) {
  //   const arr = this.infos.slice();
  //   if (arr.indexOf(message) < 0) {
  //     arr.push(message);
  //   }
  //   this.infos = arr;
  // }

  @action
  addError(message) {
    const arr = this.list.slice();
    arr.push({
      type: 'error',
      message,
    });
    this.list = arr;
  }

  @action
  addInfoWithData(message, data) {
    const arr = this.list.slice();
    arr.push({
      type: 'info',
      message,
      data,
    });
    this.list = arr;
  }

  @action
  addSuccess(message) {
    const arr = this.list.slice();
    arr.push({
      type: 'success',
      message,
    });
    this.list = arr;
  }
}

export default Notifiers;
