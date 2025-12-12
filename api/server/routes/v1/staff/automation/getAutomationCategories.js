const Sentry = require('@sentry/node');
const h = require('../../../../helpers');
const c = require('../../../../controllers');

/**
 * Retrieves automation categories for a specified agency and platform.
 *
 * This API endpoint fetches all automation categories associated with the provided agency ID
 * and platform, optionally filtering by title if provided in the query parameters.
 *
 * @async
 * @function handler
 * @param {FastifyRequest} request - The incoming request object.
 * @param {Object} request.query - Query parameters.
 * @param {string} request.query.agency_id - The ID of the agency.
 * @param {string} request.query.platform - The platform of the automation categories.
 * @param {string} [request.query.title] - Optional title to filter the categories.
 * @param {FastifyResponse} reply - The reply object to send the response.
 *
 * @returns {Promise<void>}
 */

async function handler(request, reply) {
  const { agency_id, platform, title } = request.query;

  const queryParams = {
    agency_fk: agency_id,
    platform
  }

  // Optional Include title in queryParams only if it's defined
  if (title) {
    queryParams.title = title;
  }

  const categories = await c.automationCategory.findAll(
    queryParams,
    { order: [['created_date', 'ASC']] },
  );

  try {
    h.api.createResponse(
      request,
      reply,
      200,
      { categories },
      'automation-category-1689818819-retrieved-success',
    );
  } catch (err) {
    Sentry.captureException(err);
    request.log.error({
      error: err,
      url: "/staff/automation/categories"
    });    
    h.api.createResponse(
      request,
      reply,
      500,
      {},
      'automation-category-1689818819-retrieved-failed',
    );
  }
}

module.exports.handler = handler;
