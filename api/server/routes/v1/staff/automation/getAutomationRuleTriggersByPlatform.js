const Sentry = require('@sentry/node');
const h = require('../../../../helpers');
const c = require('../../../../controllers');

/**
 * Retrieves automation rule triggers based on the specified platform.
 * @async
 * @function handler
 * @param {FastifyRequest} request - The incoming request object.
 * @param {Object} request.params - The parameters from the URL path.
 * @param {string} request.params.platform - The platform used to filter automation rule triggers.
 * @param {FastifyResponse} reply - The reply object used to send the response.
 *
 * @returns {Promise<void>}
 */

async function handler (request, reply) {
  const { platform } = request.params;

  const triggers = await c.automationRuleTrigger.findAll(
    { platform },
    { order: [['created_date', 'ASC']] },
  );

  try {
    h.api.createResponse(
      request,
      reply,
      200,
      { triggers },
      'automation-trigger-1689818819-retrieved-success',
    );
  } catch (err) {
    Sentry.captureException(err);
    request.log.error({
      error: err,
      url: "/staff/automation/rule-triggers/:platform"
    });
    h.api.createResponse(
      request,
      reply,
      500,
      {},
      'automation-trigger-1689818819-retrieved-failed',
    );
  }
}

module.exports.handler = handler;
