const Sentry = require('@sentry/node');
const userMiddleware = require('../../../../middlewares/user');
const agencyMiddleware = require('../../../../middlewares/agency');
const c = require('../../../../controllers');
const models = require('../../../../models');
const constant = require('../../../../constants/constant.json');
const h = require('../../../../helpers');
const portal = constant.PORTAL.WEBAPP_ADMIN;

async function preValidation(req, res) {
  await Promise.all([
    userMiddleware.isLoggedIn(req, res),
    userMiddleware.hasAccessToStaffPortal(req, res),
    agencyMiddleware.salesforceCanAddContacts(req, res),
  ]);
}

async function handler(req, res) {
  const { ek: encryptionKeys } = req.ek;
  const { agency_id } = req.params;
  const { sfObject } = req.query;
  const { sf_contact_ids } = req.body;

  try {
    let agency = await models.agency.findOne({
      where: {
        agency_id,
      },
    });
  
    let agencyOauth = await models.agency_oauth.findOne({
      where: {
        agency_fk: agency_id.trim(),
        status: 'active',
        source: 'SALESFORCE',
      },
    });
  
    agencyOauth =
      agencyOauth && agencyOauth.toJSON ? agencyOauth.toJSON() : agencyOauth;
  
    agency = agency && agency.toJSON ? agency.toJSON() : agency;
  
    let live_chat_settings = await models.live_chat_settings.findOne({
      where: {
        agency_fk: agency_id.trim(),
      },
    });
  
    live_chat_settings =
      live_chat_settings && live_chat_settings.toJSON
        ? live_chat_settings.toJSON()
        : live_chat_settings;
  
    const sfRecords = await h.salesforce.retrieveContactByIds({
      filter: { sf_contact_ids, sfObject },
      access_info: agencyOauth.access_info,
      live_chat_settings,
      encryptionKeys,
    });
  
    const agency_user_fk = agency?.default_outsider_contact_owner;
  
    // process adding contacts here
    const results = await h.salesforce.addSfRecords({
      sf_contacts: sfRecords,
      agency_id,
      agency_user_fk,
      log: req.log,
      models,
    });
    await c.agencyNotification.checkContactCapacityAfterUpdate(agency_id);
  
    const resBody = {
      results,
      message: 'Finished processing records',
    };
  
    return h.api.createResponse(
      req,
      res,
      200,
      resBody,
      '2-salesforce-reports-1663834299369',
      { portal },
    );
  } catch (error) {
    Sentry.captureException(error);
    req.log.error({
      error: error,
      url: "/staff/salesforce/:agency_id/contacts"
    });
    return h.api.createResponse(
      req,
      res,
      200,
      resBody,
      '2-salesforce-reports-1663834299369',
      { portal },
    );
  }
}

const schema = {
  params: {
    agency_id: { type: 'string' },
  },
  query: {
    sfObject: { type: 'string' },
  },
  body: {
    type: 'object',
    required: ['sf_contact_ids'],
    properties: {
      sf_contact_ids: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
  },
};

module.exports.preValidation = preValidation;
module.exports.handler = handler;
module.exports.schema = schema;
