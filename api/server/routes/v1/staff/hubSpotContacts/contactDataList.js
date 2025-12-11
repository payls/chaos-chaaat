const Sentry = require('@sentry/node');
const userMiddleware = require('../../../../middlewares/user');
const models = require('../../../../models');
const constant = require('../../../../constants/constant.json');
const h = require('../../../../helpers');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const moment = require('moment');

async function preValidation(req, res) {
  await Promise.all([
    userMiddleware.isLoggedIn(req, res),
    userMiddleware.hasAccessToStaffPortal(req, res),
  ]);
}

async function handler(req, res) {
  const { agency_id } = req.params;
  const { search, startDate, endDate, pageNumber, count, sort } = req.query;

  const offset = (pageNumber - 1) * count;

  let _startDate, _endDate;

  if (startDate) {
    _startDate = moment(startDate).startOf('day').toDate();
  }

  if (endDate) {
    _endDate = moment(endDate).endOf('day').toDate();
  }

  const agencyOauth = await models.agency_oauth.findOne({
    where: {
      agency_fk: agency_id.trim(),
      status: 'active',
      source: 'HUBSPOT',
    },
  });

  const { oauthRefreshResponse, hubspotClient } =
    await h.hubspot.hubspotConnect({
      agencyOauth,
      log: req.log,
    });

  // if failed to connect, return error
  if (h.cmpBool(oauthRefreshResponse.success, false)) {
    return h.api.createResponse(
      req,
      res,
      500,
      {},
      '2-hubspot-contact-list-oauth-1663834299369',
      {
        portal,
      },
    );
  }

  try {
    const { response, contacts } = await h.hubspot.retrieveContact(
      hubspotClient,
      {
        filter: {
          query: search,
          skip: offset,
          startDate: _startDate,
          endDate: _endDate,
          count,
        },
        sort,
      },
      req.log,
    );

    const resBody = {
      totalSize: response?.total,
      done: true,
      pageNumber,
      count,
      records: contacts,
    };

    return h.api.createResponse(
      req,
      res,
      200,
      resBody,
      '1-hubspot-contact-1663834299369',
      { portal },
    );
  } catch (err) {
    Sentry.captureException(err);
    req.log.error({
      err,
      url: '/staff/hubspot/:agency_id/contacts',
    });

    const resBody = {
      totalSize: 0,
      done: true,
      pageNumber,
      count: 0,
      records: [],
    };

    return h.api.createResponse(
      req,
      res,
      500,
      resBody,
      '2-hubspot-contact-1663834299369',
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
        '-Email',
      ],
    },
  },
};

module.exports.preValidation = preValidation;
module.exports.handler = handler;
module.exports.schema = schema;
