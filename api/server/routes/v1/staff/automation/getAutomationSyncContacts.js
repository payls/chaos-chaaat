const Sentry = require('@sentry/node');
const h = require('../../../../helpers');
const c = require('../../../../controllers');

/**
 * Synchronizes contacts from MindBody API.
 * 
 * @async
 * @function handler
 * @param {FastifyRequest} request - The incoming request object.
 * @param {Object} request.ek - The encryption keys used to securely sync contacts.
 * @param {FastifyResponse} reply - The reply object used to send the response.
 *
 * @returns {Promise<void>}
 */

async function handler (request, reply) {
  const { ek: encryptionKeys } = request.ek;
  const oo = await c.automationCtlr.syncContacts(
    'cd5e428d-086b-48fc-9ece-479943180256',
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
      url: "/staff/automation/sync-contacts"
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
