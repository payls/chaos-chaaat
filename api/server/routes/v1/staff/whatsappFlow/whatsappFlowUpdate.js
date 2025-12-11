const { v1: uuidv4 } = require('uuid');
const _ = require('lodash');
const Sentry = require('@sentry/node');

const c = require('../../../../controllers');
const h = require('../../../../helpers');
const constant = require('../../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const userMiddleware = require('../../../../middlewares/user');
const whatsappFlowUtils = require('./whatsappFlowUtils');

/**
 * _processWhatsappFlowUpdate - updates whatsappFlow details, updates whatsappFlow JSON, requests previewlink
 * @param {{
 *  flow_id: string,
 *  access_token: string,
 *  agencyBufferedTemplateCredentials: string,
 *  name: string,
 *  categories: Array<string>,
 *  endpoint_uri: string,
 *  json: object,
 *  log: object
 * }} param0 
 * @returns {Promise<{
 *  whatsappFlow: object,
 *  previewData: object
 * }>}
 */
async function _processWhatsappFlowUpdate ({
  flow_id,
  access_token,
  agencyBufferedTemplateCredentials,
  name,
  categories,
  endpoint_uri,
  json,
  log,
}) {
  const forUpdate = {
    flow_id,
    access_token,
    credentials: agencyBufferedTemplateCredentials,
    categories,
    endpoint_uri
  };

  if (name) {
    forUpdate.name = name;
  }
  const whatsappFlow = await h.whatsapp.updateWhatsappFlow(forUpdate);

  log.info({
    message: 'New Whatsapp Flow Updated',
    whatsappFlow,
  });

  let updatedWhatsappFlowJson;

  if (json) {
    updatedWhatsappFlowJson = await h.whatsapp.updateWhatsappFlowJson({
      flow_id,
      access_token,
      json,
      credentials: agencyBufferedTemplateCredentials
    });
  
    log.info({
      message: 'Whatsapp Flow JSON Updated',
      updatedWhatsappFlowJson,
    });
  }

  // get preview link
  const previewData = await h.whatsapp.getWhatsappFlowPreview({
    flow_id,
    access_token,
    credentials: agencyBufferedTemplateCredentials
  });

  return {
    whatsappFlow,
    previewData
  };
}

/**
 * _updateWhatsappFlow - saves updated whatsapp flow to the db
 * @param {{
 *  whatsapp_flow_id: string,
 *  flow_id: string,
 *  waba_template_fk: string,
 *  crm_settings_fk: string,
 *  name: string,
 *  categories: Array<string>,
 *  json: object,
 *  previewData: object,
 *  log: object
 * }} param0 
 */
async function _updateWhatsappFlow({
  whatsapp_flow_id,
  flow_id,
  waba_template_fk,
  crm_settings_fk,
  name,
  categories,
  json,
  previewData,
  log
}) {
  // save whatsapp flow
  const whatsappFlowObj = {
    flow_id,
    waba_template_fk,
    crm_settings_fk,
    flow_name: name,
    flow_categories: categories[0],
    flow_payload: JSON.stringify(json),
    preview_link: previewData?.info?.preview?.preview_url
  };

  log.info({
    message: 'Saving Whatsapp Flow to DB',
    whatsappFlowObj
  });

  await c.whatsappFlow.update(whatsapp_flow_id, whatsappFlowObj);
}

/**
 * _handleResponse
 * @param {{
*  req: object,
*  res: object,
*  whatsapp_flow_id: string
* }} param0 
*/
function _handleResponse ({ req, res, whatsapp_flow_id, flow_id }) {
  h.api.createResponse(
    req,
    res,
    200,
    { whatsapp_flow_id, flow_id },
    '1-flow-creation-1620396460',
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
function _handleErrorResponse ({ req, res, log, err }) {
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
    '2-flow-update-1620396470',
    {
      portal,
    },
  );
}

/**
 * WhatsappFlowUpdate handler - accepts whatsapp flow details in body
 * this will call UIB api to update a whatsapp_flow and saves the updated whatsapp_flow to db
 * @param {FastifyRequest} req 
 * @param {FastifyResponse} res 
 * @returns 
 */
async function handler (req, res) {
  const { whatsapp_flow_id } = req.params;
  const {
    waba_id,
    waba_template_fk,
    crm_settings_fk,
    categories,
    is_draft,
    name,
    json: JsonVal,
    endpoint_uri: endpointUriVal
  } = req.body;

  const log = req.log.child({
    route: '/v1/staff/whatsapp-flows/:whatsapp_flow_id',
    method: 'put',
    sub_id: uuidv4()
  });

  log.info({
    payload: req.body,
  });

  let json = whatsappFlowUtils.parseJson(JsonVal, log);

  try {
    const oldWhatsappFlow = await c.whatsappFlow.findOne({
      whatsapp_flow_id
    });

  
    if (!oldWhatsappFlow) {
      return res.status(400).send({
        message: 'Invalid Whatsapp Flow ID'
      });
    }

    const oldJson = whatsappFlowUtils.parseJson(oldWhatsappFlow.flow_payload, log);


    const isEqual = _.isEqual(json, oldJson);
    const flow_id = oldWhatsappFlow.flow_id;

    if (isEqual) {
      return _handleResponse({ req, res, whatsapp_flow_id, flow_id });
    }

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
  
    let endpoint_uri = endpointUriVal;
    if (!endpointUriVal) {
      endpoint_uri = whatsappFlowUtils.getEndpointUrl({
        dateofday_ms: Date.now(), // @TODO need to be dynamic in the actual flow
        agency_id,
        crm_settings_id: crm_settings_fk
      });
    }

    const { previewData } = await _processWhatsappFlowUpdate({
      flow_id,
      access_token,
      agencyBufferedTemplateCredentials,
      name,
      categories,
      endpoint_uri,
      json: isEqual ? null : json,
      log,
    });

    // save whatsapp flow
    await _updateWhatsappFlow({
      whatsapp_flow_id,
      flow_id,
      waba_template_fk,
      crm_settings_fk,
      name,
      categories,
      json,
      previewData,
      log,
    });

    _handleResponse({ req, res, whatsapp_flow_id, flow_id });
  } catch (err) {
    _handleErrorResponse({ req, res, log, err });
  }
}

/**
 * preValidation handler - validates if the user is loggedIn and is a staff / admin
 * @param {FastifyRequest} req 
 * @param {FastifyResponse} res 
 * @returns 
 */
async function preValidation (req, res) {
  await userMiddleware.isLoggedIn(req, res);
  await userMiddleware.hasAccessToStaffPortal(req, res);
}

const schema = {
  param: {
    whatsapp_flow_id: { type: 'string' }
  },
  body: {
    type: 'object',
    required: ['waba_id'],
    properties: {
      waba_id: { type: 'string' },
      waba_template_fk: { type: 'string' },
      crm_settings_fk: { type: 'string' },
      is_draft: { type: 'boolean', default: true },
      endpoint_uri: { type: 'string' },
      name: { type: 'string' },
      categories: {
        type: 'array',
        items: { type: 'string' },
        default: ['APPOINTMENT_BOOKING']
      },
      json: {
        anyOf: [
          { type: 'object' },
          { type: 'string' }
        ]
      }
    }
  }
};

module.exports.handler = handler;
module.exports.preValidation = preValidation;
module.exports.schema = schema;
