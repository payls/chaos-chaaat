const { v1: uuidv4 } = require('uuid');
const Sentry = require('@sentry/node');

const c = require('../../../../controllers');
const h = require('../../../../helpers');
const constant = require('../../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const userMiddleware = require('../../../../middlewares/user');
const whatsappFlowUtils = require('./whatsappFlowUtils');

/**
 * _processWhatsappFlowCreation - sends a whatsappflow to uib and requests a preview link
 * @param {{
 *  access_token: string,
 *  agencyBufferedTemplateCredentials: string,
 *  name: string,
 *  categories: Array<string>,
 *  endpoint_uri: string,
 *  json: object,
 *  log: object
 * }} param0 
 * @returns {{
 *  whatsappFlow: object,
 *  previewData: object
 * }}
 */
async function _processWhatsappFlowCreation ({
  access_token,
  agencyBufferedTemplateCredentials,
  name,
  categories,
  endpoint_uri,
  json,
  log,
}) {
  const newWhatsappFlow = await h.whatsapp.createWhatsappFlow({
    access_token,
    credentials: agencyBufferedTemplateCredentials,
    name,
    categories,
    endpoint_uri
  });

  log.info({
    message: 'New Whatsapp Flow Created',
    newWhatsappFlow,
  });

  const updatedWhatsappFlow = await h.whatsapp.updateWhatsappFlowJson({
    flow_id: newWhatsappFlow.id,
    access_token,
    json,
    credentials: agencyBufferedTemplateCredentials
  });

  log.info({
    message: 'Whatsapp Flow Updated',
    updatedWhatsappFlow,
  });

   // get preview link
  const previewData = await h.whatsapp.getWhatsappFlowPreview({
    flow_id: newWhatsappFlow.id,
    access_token,
    credentials: agencyBufferedTemplateCredentials
  });

  return { whatsappFlow: newWhatsappFlow, previewData };
}

/**
 * _insertWhatsappFLow - inserts the whatsappFlow data into the database
 * @param {{
 *  agencyUser: object,
 *  waba_template_fk: string,
 *  crm_settings_fk: string,
 *  whatsappFlow: object,
 *  name: string,
 *  categories: Array<string>,
 *  json: object,
 *  previewData: object,
 *  log: object
 * }} param0 
 * @returns {string}
 */
async function _insertWhatsappFLow ({
  agencyUser,
  waba_template_fk,
  crm_settings_fk,
  whatsappFlow,
  name,
  categories,
  json,
  previewData,
  log,
}) {
  // save whatsapp flow
  const whatsappFlowObj = {
    waba_template_fk,
    crm_settings_fk,
    flow_id: whatsappFlow.id,
    flow_name: name,
    flow_categories: categories[0],
    flow_payload: JSON.stringify(json),
    status: 'pending',
    preview_link: previewData?.info?.preview?.preview_url,
    created_by: agencyUser?.agency_user_id
  };

  log.info({
    message: 'Saving Whatsapp Flow to DB',
    whatsappFlowObj
  });

  const whatsapp_flow_id = await c.whatsappFlow.create(whatsappFlowObj);

  return whatsapp_flow_id;
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
    url: '/staff/whatsapp-flows/create',
  });
  if (err.status && err.status >= 400 && err.status < 500) {
    console.log(err.message);
    return res.status(400).send({
      message: err?.message || 'Please check input and try again'
    });
  }

  h.api.createResponse(
    req,
    res,
    500,
    { err },
    '2-flow-creation-1620396470',
    {
      portal,
    },
  );
}

/**
 * WhatsappFlowCreate handler - accepts whatsappFlow details in body
 * this will call UIB api to create a whatsapp_flow and save details to the database
 * @param {FastifyRequest} req 
 * @param {FastifyResponse} res 
 * @returns 
 */
async function handler (req, res) {
  const {
    waba_id,
    waba_template_fk,
    crm_settings_fk,
    crm_type = 'GCALENDAR',
    categories,
    is_draft,
    name,
    json: JsonVal,
    endpoint_uri: endpointUriVal,
  } = req.body;

  let flow_name = name;
  if (!flow_name) {
    flow_name = 'Appointment Booking ' + uuidv4();
  }

  const log = req.log.child({
    route: '/v1/staff/whatsapp-flows',
    method: 'get',
    sub_id: uuidv4()
  });

  log.info({
    payload: req.body,
  });

  let json = whatsappFlowUtils.parseJson(JsonVal, log);

  try {
    const creds = await whatsappFlowUtils.getWabaBufferedCredentials(waba_id);
    const {
      agency_id,
      access_token,
      agencyBufferedTemplateCredentials,
    } = creds;

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
        crm_type,
        dateofday_ms: Date.now(), // @TODO need to be dynamic in the actual flow
        agency_id,
        crm_settings_id: crm_settings_fk
      });
    }
  
    const { whatsappFlow, previewData } = await _processWhatsappFlowCreation({
      access_token,
      agencyBufferedTemplateCredentials,
      name: flow_name,
      categories,
      endpoint_uri,
      json,
      log
    });

    const { user_id } = h.user.getCurrentUser(req);
    const agencyUser = await whatsappFlowUtils.getAgencyUser(user_id, agency_id);

    const whatsapp_flow_id = await _insertWhatsappFLow({
      agencyUser,
      waba_template_fk,
      crm_settings_fk,
      whatsappFlow,
      name: flow_name,
      categories,
      json,
      previewData,
      log,
    });

    _handleResponse({ req, res, whatsapp_flow_id, flow_id: whatsappFlow.id });
  } catch (err) {
    console.log(err);
    _handleErrorResponse({ req, res, err, log });
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
  body: {
    type: 'object',
    required: ['waba_id', 'crm_settings_fk'],
    properties: {
      waba_id: { type: 'string' },
      waba_template_fk: { type: 'string' },
      crm_type: { type: 'string', default: 'GCALENDAR' },
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
