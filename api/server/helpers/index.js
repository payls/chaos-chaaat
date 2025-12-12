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
const leadStatusHelper = require('./leadStatus');
const chartHelper = require('./charts');
const contactActivityHelper = require('./contactActivity');
const projectHelper = require('./project');
const propertyHelper = require('./property');
const whatsappHelper = require('./whatsapp');
const salesforceHelper = require('./salesforce');
const hubspotHelper = require('./hubspot');
const appSyncHelper = require('./appsync');
const liveChatHelper = require('./livechat');
const lineHelper = require('./line');
const fbMessengerHelper = require('./fbmessenger');
const mobileHelper = require('./mobile');
const cryptoHelper = require('./cryptoHelper');

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
  leadStatus: leadStatusHelper,
  chartHelper: chartHelper,
  contactActivity: contactActivityHelper,
  project: projectHelper,
  property: propertyHelper,
  whatsapp: whatsappHelper,
  salesforce: salesforceHelper,
  hubspot: hubspotHelper,
  appsync: appSyncHelper,
  livechat: liveChatHelper,
  line: lineHelper,
  fbmessenger: fbMessengerHelper,
  mobile: mobileHelper,
  crypto: cryptoHelper,

  // Generic functions
  log: generalHelper.log,
  isEmpty: generalHelper.isEmpty,
  notEmpty: generalHelper.notEmpty,
  cmpStr: generalHelper.cmpStr,
  cmpInt: generalHelper.cmpInt,
  cmpBool: generalHelper.cmpBool,
  getMessageByCode: generalHelper.getMessageByCode,
  getDateTimeInterval: generalHelper.getDateTimeInterval,
};
