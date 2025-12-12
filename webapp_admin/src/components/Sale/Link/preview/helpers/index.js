import * as generalHelper from './general';
import * as formHelper from './form';
import * as apiHelper from './api';
import * as validateHelper from './validate';
import * as cookieHelper from './cookie';
import * as authHelper from './auth';
import * as userHelper from './user';
import * as tableHelper from './table';
import * as routeHelper from './route';
import * as dateHelper from './date';
import * as intercomHelper from './intercom';
import * as hubspotHelper from './hubspot';
import * as currencyHelper from './currency';
import * as translationHelper from './translation';
import * as attachmentHelper from './attachment';
import * as downloadHelper from './download';
import * as imageHelper from './image';
import * as themeHelper from './theme';

export const h = {
  general: generalHelper,
  form: formHelper,
  api: apiHelper,
  validate: validateHelper,
  cookie: cookieHelper,
  auth: authHelper,
  user: userHelper,
  table: tableHelper,
  route: routeHelper,
  date: dateHelper,
  intercom: intercomHelper,
  hubspot: hubspotHelper,
  currency: currencyHelper,
  translate: translationHelper,
  attachment: attachmentHelper,
  download: downloadHelper,
  image: imageHelper,
  theme: themeHelper,
  //General helper functions to expose on top level
  isEmpty: generalHelper.isEmpty,
  notEmpty: generalHelper.notEmpty,
  cmpStr: generalHelper.compareString,
  cmpInt: generalHelper.compareInt,
  cmpBool: generalHelper.compareBoolean,
  //Route helper functions to expose on top level
  getRoute: routeHelper.getRoute,
};
