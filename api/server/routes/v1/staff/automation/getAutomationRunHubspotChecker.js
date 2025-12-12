const Sentry = require('@sentry/node');
const h = require('../../../../helpers');
const c = require('../../../../controllers');

/**
 * Executes HubSpot automation response check based on active rules.
 *
 * This API endpoint processes automation rules that are marked as "active" and checks for 
 * responses based on HubSpot form submissions.
 * @async
 * @function handler
 * @param {FastifyRequest} request - The incoming request object.
 * @param {Object} request.ek - Encryption keys used to trigger the HubSpot automation response check.
 * @param {FastifyResponse} reply - The reply object used to send the response.
 *
 * @returns {Promise<void>}
 */
async function handler (request, reply) {
  const { ek: encryptionKeys } = request.ek;
  const oo = await c.automationCtlr.runHubSpotAutomationResponseCheck(
    encryptionKeys,
  );
  try {
    h.api.createResponse(
      request,
      reply,
      200,
      { object: oo },
      'automation-packages-1689818819-retrieved-success',
    );
  } catch (err) {
    Sentry.captureException(err);
    request.log.error({
      error: err,
      url: "/staff/automation/run-hubspot-response-checker"
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
