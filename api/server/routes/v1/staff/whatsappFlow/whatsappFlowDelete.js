const { v1: uuidv4 } = require('uuid');
const Sentry = require('@sentry/node');

const c = require('../../../../controllers');
const h = require('../../../../helpers');
const constant = require('../../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const userMiddleware = require('../../../../middlewares/user');
const whatsappFlowUtils = require('./whatsappFlowUtils');

/**
 * _handleResponse
 * @param {{
*  req: object,
*  res: object,
*  whatsapp_flow_id: string
* }} param0 
*/
function _handleResponse ({req, res, whatsapp_flow_id }){
  h.api.createResponse(
    req,
    res,
    200,
    { whatsapp_flow_id },
    '1-flow-delete-1620396460',
    portal,
  );
}

/**
 * _handleErrorResponse
 * @param {{
*  req: object,
*  res: object,
*  err: object,
*  log: object
* }} param0 
*/
function _handleErrorResponse ({ req, res, err, log }) {
  Sentry.captureException(err);
  log.error({
    error: err,
    errorString: String(err),
  });
  if (err.status) {
    return res.status(err.status).send({
      message: err?.message || 'Please check input and try again'
    });
  }

  h.api.createResponse(
    req,
    res,
    500,
    { err },
    '2-flow-delete-1620396470',
    {
      portal,
    },
  );
}

/**
 * WhatsappFlowDelete handler - accepts whatsapp_flow_id as parameter and waba_id in body
 * this will call UIB api to delete a whatsapp_flow based on flow_id also deletes record in the database
 * @param {FastifyRequest} req 
 * @param {FastifyResponse} res 
 * @returns 
 */
async function handler(req, res) {
  const { whatsapp_flow_id } = req.params;
  const { waba_id } = req.body;

  const log = req.log.child({
    route: '/v1/staff/whatsapp-flows/:whatsapp_flow_id/delete',
    method: 'post',
    sub_id: uuidv4()
  });

  try {
    const oldWhatsappFlow = await c.whatsappFlow.findOne({
      whatsapp_flow_id
    });

    if (!oldWhatsappFlow) {
      return res.status(400).send({
        message: 'Invalid Whatsapp Flow ID'
      });
    }

    const flow_id = oldWhatsappFlow.flow_id;

    const {
      agency_id,
      access_token,
      agencyBufferedTemplateCredentials,
    } = await whatsappFlowUtils.getWabaBufferedCredentials(waba_id);

    if (!agencyBufferedTemplateCredentials) {
      log.warn({
        message: 'Agency WABA Configuration Missing.',
        agency_id
      });

      return res.status(403).send({
        message: 'Agency WABA Configuration Missing.'
      });
    }

    await h.whatsapp.deleteWhatsappFlowById({
      flow_id,
      access_token,
      credentials: agencyBufferedTemplateCredentials,
    });

    await c.whatsappFlow.destroy({ whatsapp_flow_id });

    _handleResponse({ req, res, whatsapp_flow_id });
  } catch (err) {
    _handleErrorResponse({ req, res, err, log });
  }
}

/**
 * preValidation handler - validates if the user is loggedIn and is a staff / admin
 * @param {FastifyRequest} req 
 * @param {FastifyResponse} res 
 * @returns 
 */
async function preValidation(req, res) {
  await userMiddleware.isLoggedIn(req, res);
  await userMiddleware.hasAccessToStaffPortal(req, res);
}

const schema = {
  param: {
    whatsapp_flow_id: { type: 'string' },
  },
  body: {
    type: 'object',
    required: ['waba_id'],
    properties: {
      waba_id: { type: 'string' },
    }
  }
};

module.exports.handler = handler;
module.exports.preValidation = preValidation;
module.exports.schema = schema;
