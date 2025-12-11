const constant = require('../constants/constant.json');
const config = require('../configs/config')(process.env.NODE_ENV);
const apiHelper = module.exports;
const h = {
  general: require('./general'),
};

/**
 * Create API response
 * @param {object} reply
 * @param {number} statusCode
 * @param {object} data
 * @param {string} messageCode
 * @param {{portal?:string}} options
 * @returns {FastifyReply<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig>}
 */
apiHelper.createResponse = (
  reply,
  statusCode = 200,
  data,
  messageCode,
  { portal = '' } = {},
) => {
  portal = portal || constant.PORTAL.WEBAPP;
  const message = h.general.getMessageByCode(messageCode);
  const status = statusCode >= 200 && statusCode < 400 ? 'ok' : 'error';
  data.status = status;
  data.message = message;
  data.message_code = messageCode;
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    // 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    // 'Access-Control-Allow-Headers': 'Origin, Accept, X-Requested-With, content-type, Authorization, x-access-token',
    // 'Access-Control-Allow-Credentials': true
  };
  // if (!h.general.cmpStr(process.env.NODE_ENV, 'development')) {
  switch (portal) {
    case constant.PORTAL.WEBAPP_ADMIN:
      headers['Access-Control-Allow-Origin'] = config.webAdminUrl;
      break;
    case constant.PORTAL.WEBAPP:
    default:
      headers['Access-Control-Allow-Origin'] = config.webUrl;
      break;
  }
  // }
  return reply.code(statusCode).headers(headers).send(data);
};

/**
 * Handles api response
 * @param {object} response
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
apiHelper.handleApiResponse = async (response, showMessage = true) => {
  const apiRes = { status: '', data: {} };
  if (!response) return apiRes;
  apiRes.data = response.data || {};
  if (h.general.notEmpty(response) && h.general.cmpStr(response.status, 200)) {
    apiRes.status = 'ok';
  } else {
    apiRes.status = 'error';
  }
  return apiRes;
};
