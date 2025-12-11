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

async function handler(req, res) {
  const { ek: encryptionKeys } = req.ek;
  const { agency_id } = req.params;
  const {
    search,
    startDate,
    endDate,
    pageNumber = 1,
    count = 200,
    sfObject = 'Lead',
    sort
  } = req.query;

  let offset = ((pageNumber - 1) * count)

  let _startDate, _endDate;

  if (startDate) {
    _startDate = new Date(startDate)
  }

  if (endDate) {
    _endDate = new Date(endDate)
  }

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

  try {
    const { records: contact_list, count: totalCount } = await h.salesforce.retrieveContact({
      filter: {
        LastName: search,
        FirstName: search,
        Name: search,
        Phone: search,
        skip: offset,
        startDate,
        endDate,
        sfObject,
        count
      },
      sort,
      access_info: agencyOauth.access_info,
      live_chat_settings,
      encryptionKeys
    });

    const resBody = {
      totalSize: totalCount,
      done: true,
      pageNumber,
      count,
      records: contact_list
    };
  
    return h.api.createResponse(req, res, 200, resBody, '1-salesforce-reports-1663834299369', { portal });
  } catch (err) {
    Sentry.captureException(err);
    req.log.warn({
      err,
      url: '/staff/salesforce/:agency_id/contacts',
    });

    const resBody = {
      totalSize: 0,
      done: true,
      pageNumber,
      count: 0,
      records: []
    };
  
    return h.api.createResponse(req, res, 200, resBody, '2-salesforce-reports-1663834299369', { portal });
  }
}

const schema = {
  params: {
    agency_id: { type: 'string' }
  },
  query: {
    sfObject: { type: 'string' },
    search: { type: 'string' },
    startDate: { type: 'string' },
    endDate: { type: 'string' },
    pageNumber: { type: 'number' },
    count: { type: 'number' },
    sort: {
      type: 'string',
      enum: [
        'CreatedDate',
        '-CreatedDate',
        'FirstName',
        '-FirstName',
        'LastName',
        '-LastName',
        'Email',
        '-Email'
      ]
    }
  }
};

module.exports.preValidation = preValidation;
module.exports.handler = handler;
module.exports.schema = schema;
