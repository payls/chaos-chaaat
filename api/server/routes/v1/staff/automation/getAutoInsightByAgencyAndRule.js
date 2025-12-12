const Sentry = require('@sentry/node');
const h = require('../../../../helpers');
const c = require('../../../../controllers');


const schema = {
  params: {
    agency_id: { type: 'string' },
    automation_rule_id: { type: 'string' },
  },
};

/**
 * Retrieves automation insights for a specified agency and automaiton ID.
 * @async
 * @function handler
 * @param {FastifyRequest} request
 * @param {Object} request.params - The route parameters of the request.
 * @param {string} request.params.agency_id - The ID of the agency.
 * @param {string} request.params.automation_rule_id - The ID of the automation rule.
 * @param {FastifyResponse} reply
 *
 * @returns {Promise<void>}
 */

async function handler (request, reply) {
  const { agency_id, automation_rule_id } = request.params;
  try {
    const data =
      await c.whatsappMessageTracker.getAutomationWhatsAppMessageTracker(
        agency_id,
        automation_rule_id,
      );
    let insight = data[0].dataValues;
    if (!h.isEmpty(insight.triggered_count)) {
      insight.sent_percentage =
        (insight.sent_count / insight.triggered_count) * 100;
      insight.failed_percentage =
        (insight.failed_count / insight.triggered_count) * 100;
      insight.delivered_percentage =
        (insight.delivered_count / insight.sent_count) * 100;
      insight.read_percentage =
        (insight.read_count / insight.delivered_count) * 100;
      insight.replied_percentage =
        (insight.with_reply_count / insight.read_count) * 100;
    } else {
      insight = {
        triggered_count: 0,
        sent_count: 0,
        delivered_count: 0,
        failed_count: 0,
        read_count: 0,
        with_reply_count: 0,
        sent_percentage: 0,
        failed_percentage: 0,
        delivered_percentage: 0,
        read_percentage: 0,
        replied_percentage: 0,
      };
    }
    h.api.createResponse(
      request,
      reply,
      200,
      { insight },
      'automation-history-insight-1689818819-success',
    );
  } catch (err) {
    Sentry.captureException(err);
    request.log.error({
      error: err,
      url: "/staff/automation/insight/:agency_id/:automation_rule_id"
    });
    h.api.createResponse(
      request,
      reply,
      500,
      {},
      'automation-history-insight-1689818819-failed',
    );
  }
}

module.exports.schema = schema;
module.exports.handler = handler;
