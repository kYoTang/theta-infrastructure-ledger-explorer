import { BigNumber } from 'bignumber.js';
import _ from 'lodash';
import moment from 'moment';

import { TxnTypes, TxnTypeText, TxnStatus, WEI } from 'common/constants';
BigNumber.config({ EXPONENTIAL_AT: 1e+9 });


export function totalCoinValue(set, key = 'tfuelwei') {
  //_.forEach(set, v => console.log(_.get(v, `coins.${key}`, 0)))
  return _.reduce(set, (acc,v) => acc + parseInt(_.get(v, `coins.${key}`, 0)), 0)
}

export function from(txn, trunc = null) {
  let path;

  if([TxnTypes.RESERVE_FUND, TxnTypes.SERVICE_PAYMENT].includes(txn.type)) {
    path = 'data.source.address';
  } else if(txn.type === TxnTypes.SPLIT_CONTRACT) {
    path = 'data.initiator.address';
  } else if(txn.type === TxnTypes.COINBASE) {
    path = 'data.proposer.address';
  } else {
    path = 'data.inputs[0].address';
  }

  let addr = _.get(txn, path);
  if(trunc && trunc > 0) {
    addr = _.truncate(addr, trunc);
  }
  return addr;
}

export function to(txn, trunc = null) {
  let path;
  if(txn.type === TxnTypes.SERVICE_PAYMENT) {
    path = 'data.target.address';
  } else if(txn.type === TxnTypes.COINBASE) {
    path = '';
  } else {
    path = 'data.outputs[0].address';
  }

  let addr = _.get(txn, path);
  if(trunc && trunc > 0) {
    addr = _.truncate(addr, trunc);
  }
  return addr;
}

export function type(txn) {
  if(txn.status === TxnStatus.PENDING) {
    return status(txn);
  }
  return TxnTypeText[txn.type];
}


export function status(txn) {
  if(!txn.status) {
    return "Finalized";
  }
  return _.capitalize(txn.status);
}



export function fee(txn) {
  let f = _.get(txn, 'data.fee.tfuelwei');
  f = BigNumber(f).dividedBy(WEI);
  return f.toString();
}

export function value(txn) {
  let values = [
    totalCoinValue(_.get(txn, 'data.inputs'), 'tfuelwei'),
    totalCoinValue(_.get(txn, 'data.inputs'), 'thetawei')];
  return _.chain(values)
    .map(v => v ? new BigNumber(v).dividedBy(WEI) : "0")
    .filter(Boolean)
    .map(v => v.toString(10))
    .value();
}

export function hash(txn, trunc = null) {
  let a = _.get(txn, 'hash')
  if(trunc && trunc > 0) {
    a = _.truncate(a, { length: trunc });
  }
  return a;
}

export function age(txn) {
  if(!txn.timestamp || !_.isNumber(parseInt(txn.timestamp)))
    return null;
  return moment(parseInt(txn.timestamp) * 1000).fromNow(true);
}

export function date(txn) {
  if(!txn.timestamp || !_.isNumber(parseInt(txn.timestamp)))
    return null;
  return moment(parseInt(txn.timestamp) * 1000).format("MM/DD/YY hh:mma");
}