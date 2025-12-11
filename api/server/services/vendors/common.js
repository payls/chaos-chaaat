const constant = require('../../constants/constant.json');

class VendorCommon {
  constructor() {
    this.portal = constant.PORTAL.WEBAPP_ADMIN;
    this.constant = constant;
    this.models = require('../../models');
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

module.exports = VendorCommon;
