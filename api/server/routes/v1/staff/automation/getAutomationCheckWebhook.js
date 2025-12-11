const Sentry = require('@sentry/node');
const h = require('../../../../helpers');
const c = require('../../../../controllers');

/**
 * Checks the status of MindBody webhooks and reactivates any inactive webhooks.
 *
 * This API endpoint verifies the status of MindBody webhooks associated with an agency,
 * using the encryption keys provided in the request. If any webhook is inactive, 
 * it reactivates them and returns a log of changes.
 *
 * @async
 * @function handler
 * @param {FastifyRequest} request - The incoming request object.
 * @param {Object} request.ek - Encryption keys object.
 * @param {FastifyResponse} reply - The reply object to send the response.
 *
 * @returns {Promise<void>}
 */

async function handler (request, reply) {
  const { ek: encryptionKeys } = request.ek;
  const data = await c.automationCtlr.checkWebhooks(encryptionKeys);
  try {
    h.api.createResponse(
      request,
      reply,
      200,
      { data },
      'automation-webhook-checker-1689818819-success',
    );
  } catch (err) {
    Sentry.captureException(err);
    request.log.error({
      error: err,
      url: "/staff/automation/check-webhook"
    });   
    h.api.createResponse(
      request,
      reply,
      500,
      {},
      'automation-webhook-checker-1689818819-failed',
    );
  }
}

module.exports.handler = handler;
