const Sentry = require('@sentry/node');
const h = require('../../../../helpers');
const c = require('../../../../controllers');

/**
 * Executes automation rules based on active status.
 *
 * @async
 * @function handler
 * @param {FastifyRequest} request - The incoming request object.
 * @param {Object} request.ek - Encryption keys used to trigger the automation process.
 * @param {FastifyResponse} reply - The reply object used to send the response.
 *
 * @returns {Promise<void>}
 */

async function handler (request, reply) {
  const { ek: encryptionKeys } = request.ek;
  const oo = await c.automationCtlr.run(encryptionKeys);
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
      url: "/staff/automation/run"
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
