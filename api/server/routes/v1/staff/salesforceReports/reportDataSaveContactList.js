const Sentry = require('@sentry/node');
const c = require('../../../../controllers');
const models = require('../../../../models');
const constant = require('../../../../constants/constant.json');
const userMiddleware = require('../../../../middlewares/user');
const agencyMiddleware = require('../../../../middlewares/agency');
const h = require('../../../../helpers');
const portal = constant.PORTAL.WEBAPP_ADMIN;

async function preValidation(req, res) {
  await Promise.all([
    userMiddleware.isLoggedIn(req, res),
    userMiddleware.hasAccessToStaffPortal(req, res),
    agencyMiddleware.canSaveContactViaSalesforceReportMapping(req, res),
  ]);
}

async function handler(req, res) {
  const { ek: encryptionKeys } = req.ek;
  const { agency_id, report_id } = req.params;
  const { contact_list_id, report_name, report_instance_id, report_field_map } =
    req.body;

  let agencyOauth = await models.agency_oauth.findOne({
    where: {
      agency_fk: agency_id.trim(),
      status: 'active',
      source: 'SALESFORCE',
    },
  });

  agencyOauth =
    agencyOauth && agencyOauth.toJSON ? agencyOauth.toJSON() : agencyOauth;

  let live_chat_settings = await models.live_chat_settings.findOne({
    where: {
      agency_fk: agency_id.trim(),
    },
  });

  live_chat_settings =
    live_chat_settings && live_chat_settings.toJSON
      ? live_chat_settings.toJSON()
      : live_chat_settings;

  // create report instance
  let reportInstance;
  try {
    reportInstance = await h.salesforce.checkAndCreateReportInstanceV2({
      report_id,
      access_info: agencyOauth.access_info,
      live_chat_settings,
      encryptionKeys,
    });
  } catch (err) {
    Sentry.captureException(err);
    // conn error will throw 403
    req.log.warn({
      err,
      url: '/staff/salesforce/:agency_id/reports',
    });

    return h.api.createResponse(
      req,
      res,
      403,
      {},
      '2-salesforce-reports-1663834299369',
      { portal },
    );
  }

  // create a contact list
  const list_name = `${report_name} - ${new Date().toLocaleDateString()}`;
  await c.contactList.update(contact_list_id, {
    status: 'GENERATING',
    source_type: 'SALESFORCE',
  });
  // send rabbit mq message
  const result = await req.rabbitmq.pubSfGenerateListFromReport({
    data: {
      agency_id,
      report_id,
      instance_id: reportInstance.id,
      contact_list_id,
      report_field_map,
      timestamp_created: Date.now(),
    },
    consumerType: constant.AMQ.CONSUMER_TYPES.SF_GENERATE_LIST_FROM_REPORT,
  });

  req.log.info({
    message: 'Queuing salesforce contact note',
    data: {
      agency_id,
      report_id,
      instance_id: report_instance_id,
      contact_list_id,
    },
    success: result,
  });
  const resBody = { contact_list_id };

  return h.api.createResponse(
    req,
    res,
    200,
    resBody,
    '1-salesforce-reports-1663834299369',
    { portal },
  );
}

const schema = {
  params: {
    agency_id: { type: 'string' },
    report_id: { type: 'string' },
  },
  body: {
    type: 'object',
    required: ['contact_list_id', 'report_name', 'report_field_map'],
    properties: {
      contact_list_id: { type: 'string' },
      report_name: { type: 'string' },
      report_field_map: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            label: { type: 'string' },
            field: { type: 'string' },
            mappedTo: { type: 'string' },
            required: { type: 'boolean' },
            defaultValue: { type: 'string' },
          },
          required: ['field', 'mappedTo'],
        },
      },
    },
  },
};
module.exports.preValidation = preValidation;
module.exports.handler = handler;
module.exports.schema = schema;
