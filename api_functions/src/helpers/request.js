const constant = require('../constants/constant.json');
const portal_webapp = constant.PORTAL.WEBAPP;
const portal_webapp_admin = constant.PORTAL.WEBAPP_ADMIN;
const requestHelper = module.exports;
const config = require('../configs/config')(process.env.NODE_ENV);

/**
 * Method to get the right portal for the request
 * @param request
 * @returns {string}
 */
requestHelper.getPortal = (request) => {
  return request.headers.origin === config.webAdminUrl
    ? portal_webapp_admin
    : portal_webapp;
};
