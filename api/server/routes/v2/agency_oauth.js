const Sentry = require('@sentry/node');
const models = require('../../models');
const h = require('../../helpers');
const userMiddleware = require('../../middlewares/user');
const c = require('../../controllers');
const constants = require('../../constants/constant.json');

/**
 * Handler to update the CRM timeslot settings for an agency OAuth configuration.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
async function getCrmTimeslotSettingHandler (req, res) {
  const portal = h.request.getPortal(req);
  const source = req.params.source;
  const agency_id = req.params.agency_id;
  const { crm_timeslot_settings } = req.body;

  try {
    const agencyOauth = await c.agencyOauthCtlr.findOne({
      agency_fk: agency_id,
      source: source.toUpperCase(),
    });

    if (!agencyOauth) {
      return h.api.createResponse(
        req,
        res,
        400,
        { message: 'Missing Agency Oauth Configuration' },
        '2-agency-oauth-timeslot-1726049944',
      );
    }

    await c.agencyOauthCtlr.update(
      agencyOauth.agency_oauth_id,
      { crm_timeslot_settings: JSON.stringify(crm_timeslot_settings) }
    );

    h.api.createResponse(
      req,
      res,
      200,
      { message: 'Successfully Updated Timeslot' },
      '1-agency-oauth-timeslot-1726049944',
    );
  } catch (err) {
    Sentry.captureException(err);
    req.log.error({
      err,
      url: '/v2/agency/:agency_id/agency-oauth/:source/timeslot',
    });
    h.api.createResponse(
      req,
      res,
      500,
      {},
      '2-agency-oauth-timeslot-1726049944',
      { portal },
    );
  }
}

/**
 * Handler to retrieve the CRM timeslot settings for an agency OAuth configuration.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
async function updateCrmTimeslotSettingHandler (req, res) {
  const portal = h.request.getPortal(req);
  const source = req.params.source;
  const agency_id = req.params.agency_id;

  try {
    const agencyOauth = await c.agencyOauthCtlr.findOne({
      agency_fk: agency_id,
      source: source.toUpperCase(),
    });

    if (!agencyOauth) {
      return h.api.createResponse(
        req,
        res,
        400,
        { message: 'Missing Agency Oauth Configuration' },
        '2-agency-oauth-get-timeslot-1726049944',
      );
    }

    let crm_timeslot_settings = constants.DEFAULT_CRM_TIMESLOT_SETTING;
    if (agencyOauth.crm_timeslot_settings && agencyOauth.crm_timeslot_settings.trim() !== '') {
      crm_timeslot_settings = JSON.parse(agencyOauth.crm_timeslot_settings);
    }

    h.api.createResponse(
      req,
      res,
      200,
      { crm_timeslot_settings },
      '1-agency-oauth-get-timeslot-1726049944',
    );
  } catch (err) {
    Sentry.captureException(err);
    req.log.error({
      err,
      url: '/v2/agency/:agency/agency-oauth/:source/timeslot',
    });
    h.api.createResponse(
      req,
      res,
      500,
      {},
      '2-agency-oauth-get-timeslot-1726049944',
      { portal },
    );
  }
}

/**
 * Registers routes for agency OAuth CRM timeslot management.
 * 
 * @param {Object} fastify - The Fastify instance.
 * @param {Object} opts - Options passed to the route.
 * @param {Function} next - Callback to move to the next middleware.
 */
module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'GET',
    url: '/agency/:agency_id/agency-oauth/:source/timeslot',
    /**
     * Pre-validation middleware to check if the user is logged in.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    prevalidation: async (req, res) => {
      await Promise.all([userMiddleware.isLoggedIn(req, res)]);
    },
    handler: updateCrmTimeslotSettingHandler,
  });

  fastify.route({
    method: 'PUT',
    url: '/agency/:agency_id/agency-oauth/:source/timeslot',
    /**
     * Pre-validation middleware to check if the user is logged in.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    prevalidation: async (req, res) => {
      await Promise.all([userMiddleware.isLoggedIn(req, res)]);
    },
    schema: {
      body: {
        type: 'object',
        required: ['crm_timeslot_settings'],
        properties: {
          crm_timeslot_settings: {
            type: 'object',
            properties: {
              timeZone: {
                type: 'object',
                properties: {
                  value: { type: 'string' },
                  label: { type: 'string' },
                },
              },
              timeSlots: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    weekDay: { type: 'string', enum: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] },
                    availableSlots: {
                      type: 'array',
                      items: {
                        properties: {
                          startTime: { type: 'number' },
                          endTime: { type: 'number' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    handler: getCrmTimeslotSettingHandler,
  });

  next();
};
