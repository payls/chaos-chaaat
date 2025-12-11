const jwt = require('jsonwebtoken');
const constant = require('../constants/constant.json');
const trayMiddleware = module.exports;
const axios = require('axios');
const h = require('../helpers');
const JWT_TRAY_SECRET = process.env.JWT_TRAY_SECRET;

/**
 * Check whether is request a valid request coming form Tray
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @returns {Promise<FastifyReply<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig>>}
 */
trayMiddleware.isValidTrayRequest = async (request, reply) => {
  const funcName = 'trayMiddleware.isValidTrayRequest';
  const accessToken = h.general.getAccessToken(request);

  if (h.isEmpty(accessToken)) {
    console.log(`${funcName}: missing access token in request header`);
    return handleAccessDenied(reply);
  }

  const decodedToken = await verifyJwt(accessToken);
  if (h.isEmpty(decodedToken)) {
    await refreshToken();
    return handleAccessDenied(reply);
  }
};

/**
 * Verify JWT token is validity
 */
async function verifyJwt(token) {
  const result = await jwt.verify(token, JWT_TRAY_SECRET, (err, decoded) => {
    if (err) return null;
    return decoded;
  });
  return result;
}

/**
 * Refresh token at tray.io
 */
async function refreshToken() {
  const funcName = 'refreshToken';
  const tokenIssuedDate = Math.floor(new Date().getTime() / 1000 + 60 * 60);
  const new_token_payload = {
    sub: constant.TRAY.JWT_TOKEN.RECIPIENT,
    name: constant.TRAY.JWT_TOKEN.ISSUER,
    iat: tokenIssuedDate,
  };

  const signedJwt = jwt.sign(new_token_payload, JWT_TRAY_SECRET, {
    expiresIn: '30 days',
  });

  if (h.notEmpty(signedJwt)) {
    const axiosConfig = {
      method: 'post',
      url: constant.TRAY.AUTH_WEBHOOK.URL_REFRESH,
      data: {
        token: signedJwt,
      },
    };
    const response = await axios(axiosConfig);
    if (!response.data.status)
      throw new Error(`${funcName}: Unable to update JWT at Tray`);
  } else {
    throw new Error(`${funcName}: Unable to update JWT at Tray`);
  }
}

/**
 * Generic handle access denied reply
 * @param {FastifyReply} reply
 * @returns {FastifyReply<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig>}
 */
function handleAccessDenied(reply) {
  return h.api.createResponse(reply, 403, {}, '2-generic-002');
}
