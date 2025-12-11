const constant = require('../constants/constant.json');

class NonStaffCommon {
  constructor() {
    this.portal = constant.PORTAL.WEBAPP;
    this.constant = constant;
    this.models = require('../models');
    this.dbTransaction = null;
  }

  setDbTransaction(dbTransaction) {
    this.dbTransaction = dbTransaction;
  }

  getDbTransaction() {
    return this.dbTransaction;
  }

  clearDbTransaction() {
    this.dbTransaction = null;
  }
}

module.exports = NonStaffCommon;
