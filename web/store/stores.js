import Account from './AccountStore';
import Notifiers from './Notifiers';
import KYCStore from './KYCStore';
import Tokensale from './Tokensale';
import Proofs from './ProofsStore';

const stores = {};

stores.notifiers = new Notifiers(stores);
stores.kyc = new KYCStore(stores);
stores.account = new Account(stores);
stores.sto = new Tokensale(stores);
stores.proofs = new Proofs(stores);

export default stores;
