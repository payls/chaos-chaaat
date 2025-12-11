const Sentry = require('@sentry/node');
const h = require('../../../../helpers');
const c = require('../../../../controllers');

/**
 * Retrieves MindBody packages associated with an agency.
 *
 * This API endpoint fetches all active (non-deleted) MindBody packages linked to a specified agency.
 *
 * @async
 * @function handler
 * @param {FastifyRequest} request - The incoming request object.
 * @param {Object} request.query - The query parameters.
 * @param {string} request.query.agency_id - The ID of the agency to retrieve packages for.
 * @param {FastifyResponse} reply - The reply object used to send the response.
 *
 * @returns {Promise<void>}
 */

async function handler (request, reply) {
  const { agency_id } = request.query;
  const packages = await c.mindBodyPackage.findAll(
    { agency_fk: agency_id, is_deleted: 0 },
    { order: [['created_date', 'ASC']] },
  );

  try {
    h.api.createResponse(
      request,
      reply,
      200,
      { packages },
      'automation-packages-1689818819-retrieved-success',
    );
  } catch (err) {
    Sentry.captureException(err);
    request.log.error({
      error: err,
      url: "/staff/automation/packages"
    });
    h.api.createResponse(
      request,
      reply,
      500,
      {},
      'automation-packages-1689818819-retrieved-failed',
    );
  }
}

module.exports.handler = handler;
