const Sentry = require('@sentry/node');
const h = require('../../../../helpers');
const c = require('../../../../controllers');


/**
 * Handles the automation execution for an immediate submission trigger.
 *
 * @async
 * @function handler
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @returns {Promise<void>}
 */

async function handler (request, reply) {
  const { contact_id, form_id, trigger_id } = request.body;

  const { ek: encryptionKeys } = request.ek;

  try {
    switch (trigger_id) {
      case 'da7875aa-7e42-4260-8941-02ba9b90e0d1':
        await c.automationCtlr.runImmediateForSubmission(
          form_id,
          contact_id,
          trigger_id,
          encryptionKeys,
        );
        break;
      default:
        break;
    }

    h.api.createResponse(
      request,
      reply,
      200,
      {},
      'automation-hubspot-1689818819-run-immediate-success',
    );
  } catch (err) {
    Sentry.captureException(err);
    request.log.error({
      error: err,
      url: "/staff/automation/run/immediate"
    });
    h.api.createResponse(
      request,
      reply,
      500,
      {},
      'automation-hubspot-1689818819-run-immediate-failed',
    );
  }
}

module.exports.handler = handler;
