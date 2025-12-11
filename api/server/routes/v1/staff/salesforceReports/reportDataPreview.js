const Sentry = require('@sentry/node');
const userMiddleware = require('../../../../middlewares/user');
const c = require('../../../../controllers');
const models = require('../../../../models');
const constant = require('../../../../constants/constant.json');
const h = require('../../../../helpers');
const portal = constant.PORTAL.WEBAPP_ADMIN;

async function preValidation(req, res) {
  await Promise.all([
    userMiddleware.isLoggedIn(req, res),
    userMiddleware.hasAccessToStaffPortal(req, res),
  ]);
}

async function handler (req, res) {
  const { ek: encryptionKeys } = req.ek;
  const { agency_id, report_id } = req.params;

  let agencyOauth = await models.agency_oauth.findOne({
    where: {
      agency_fk: agency_id.trim(),
      status: 'active',
      source: 'SALESFORCE',
    },
  });

  agencyOauth =
    agencyOauth && agencyOauth.toJSON
      ? agencyOauth.toJSON()
      : agencyOauth;

  let live_chat_settings = await models.live_chat_settings.findOne({
    where: {
      agency_fk: agency_id.trim()
    }
  });

  live_chat_settings =
    live_chat_settings && live_chat_settings.toJSON
        ? live_chat_settings.toJSON()
        : live_chat_settings;

  let reportData = [];

  try {
    reportData = await h.salesforce.retrieveSFReportDataV2({
      access_info: agencyOauth.access_info,
      report_id,
      live_chat_settings,
      encryptionKeys
    });
  } catch (err) {
    Sentry.captureException(err);
    req.log.warn({
      err,
      url: '/staff/salesforce/:agency_id/reports/:report_id/preview',
    });
  }

  const resBody = {
    results: reportData,
    success: true
  };

  return h.api.createResponse(req, res, 200, resBody, '1-salesforce-reports-1663834299369', { portal });
}

const schema = {
  params: {
    agency_id: { type: 'string' },
    report_id: { type: 'string' }
  }
};

module.exports.preValidation = preValidation;
module.exports.handler = handler;
module.exports.schema = schema;
