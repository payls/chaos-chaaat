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
const routeHelper = require('./route');
const whatsappHelper = require('./whatsapp');
const smsHelper = require('./sms');
const salesforce = require('./salesforce');
const campaign = require('./campaign');
const slack = require('./slack');
const appsync = require('./appsync');
const livechat = require('./livechat');
const line = require('./line');
const fbmessenger = require('./fbmessenger');
const linedirect = require('./linedirect');
const cryptoHelper = require('./cryptoHelper');
const automation = require('./automation');
const mobileHelper = require('./mobile');
const hubspotHelper = require('./hubspot');

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
  route: routeHelper,
  whatsapp: whatsappHelper,
  sms: smsHelper,
  salesforce,
  campaign,
  slack,
  appsync,
  livechat,
  line,
  fbmessenger,
  linedirect,
  crypto: cryptoHelper,
  automation,
  mobile: mobileHelper,
  hubspot: hubspotHelper,

  // Generic functions
  log: generalHelper.log,
  isEmpty: generalHelper.isEmpty,
  notEmpty: generalHelper.notEmpty,
  cmpStr: generalHelper.cmpStr,
  cmpInt: generalHelper.cmpInt,
  cmpBool: generalHelper.cmpBool,
  getMessageByCode: generalHelper.getMessageByCode,
};
