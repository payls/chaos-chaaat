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
const requestHelper = require('./request');
const routeHelper = require('./route');
const currencyHelper = require('./currency');
const miscHelper = require('./misc');
const smsHelper = require('./sms');
const whatsappHelper = require('./whatsapp');
const hubspotHelper = require('./hubspot');
const dataHelper = require('./data');
const StripeHelper = require('./stripe');

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
  request: requestHelper,
  route: routeHelper,
  currency: currencyHelper,
  misc: miscHelper,
  sms: smsHelper,
  whatsapp: whatsappHelper,
  hubspot: hubspotHelper,
  data: dataHelper,
  stripe: new StripeHelper(),

  // Generic functions
  log: generalHelper.log,
  isEmpty: generalHelper.isEmpty,
  notEmpty: generalHelper.notEmpty,
  cmpStr: generalHelper.cmpStr,
  cmpInt: generalHelper.cmpInt,
  cmpBool: generalHelper.cmpBool,
  getMessageByCode: generalHelper.getMessageByCode,
  generateId: generalHelper.generateId,
};
