const Sentry = require('@sentry/node');
const h = require('../../../../helpers');
const c = require('../../../../controllers');

/**
 * Retrieves an automation category by its ID.
 *
 * This API endpoint fetches a specific automation category identified by the 
 * `automation_category_id` provided in the request parameters.
 *
 * @async
 * @function handler
 * @param {FastifyRequest} request - The incoming request object.
 * @param {Object} request.params - Path parameters.
 * @param {string} request.params.automation_category_id - The ID of the automation category to retrieve.
 * @param {FastifyResponse} reply - The reply object to send the response.
 *
 * @returns {Promise<void>}
 */

async function handler (request, reply) {
  const { automation_category_id } = request.params;

  try {
    const category = await c.automationCategory.findOne({
      automation_category_id,
    });
    h.api.createResponse(
      request,
      reply,
      200,
      { category },
      'automation-category-1689818819-retrieved-success',
    );
  } catch (err) {
    Sentry.captureException(err);
    request.log.error({
      error: err,
      url: "/staff/automation/categories/:automation_category_id"
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
