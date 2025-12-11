const Sentry = require('@sentry/node');
const h = require('../../../../helpers');
const c = require('../../../../controllers');

/**
 * Retrieves HubSpot forms associated with an agency.
 *
 * This API endpoint fetches all HubSpot forms linked to a specified agency.
 *
 * @async
 * @function handler
 * @param {FastifyRequest} request - The incoming request object.
 * @param {Object} request.params - The URL parameters.
 * @param {string} request.params.agency_fk - The foreign key ID for the agency.
 * @param {FastifyResponse} reply - The reply object used to send the response.
 *
 * @returns {Promise<void>}
 */

async function handler (request, reply) {
  const { agency_fk } = request.params;

  try {
    const forms = await c.hubSpotFormCtlr.findAll({
      agency_fk,
    });
    h.api.createResponse(
      request,
      reply,
      200,
      { forms },
      'automation-form-1689818819-retrieve-success',
    );
  } catch (err) {
    Sentry.captureException(err);
    request.log.error({
      error: err,
      url: "/staff/automation/forms/:agency_fk"
    }); 
    h.api.createResponse(
      request,
      reply,
      500,
      {},
      'automation-form-1689818819-retrieve-failed',
    );
  }
}

module.exports.handler = handler;
