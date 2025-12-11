const generalHelper = require('./general');
const databaseHelper = require('./database');
const emailHelper = require('./email');
const validationHelper = require('./validation');
const apiHelper = require('./api');
const userHelper = require('./user');
const fileHelper = require('./file');
const testHelper = require('./test');
const dateHelper = require('./date');
const cacheHelper = require('./cache');
module.exports = {
  general: generalHelper,
  database: databaseHelper,
  email: emailHelper,
  validation: validationHelper,
  api: apiHelper,
  user: userHelper,
  file: fileHelper,
  test: testHelper,
  date: dateHelper,
  cache: cacheHelper,

  // Generic functions
  log: generalHelper.log,
  isEmpty: generalHelper.isEmpty,
  notEmpty: generalHelper.notEmpty,
  cmpStr: generalHelper.cmpStr,
  cmpInt: generalHelper.cmpInt,
  cmpBool: generalHelper.cmpBool,
  getMessageByCode: generalHelper.getMessageByCode,
};
