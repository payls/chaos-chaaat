const Sentry = require('@sentry/node');
const models = require("../../../../models");
const h = require("../../../../helpers");
const c = require("../../../../controllers");

/**
 * Retrieves the count of active automation for given waba account.
 *
 * This API endpoint returns the number of active automation rules for a specified business account
 * and includes the WhatsApp business account (WABA) number if available.
 *
 * @async
 * @function handler
 * @param {FastifyRequest} request
 * @param {Object} request.query - The query parameters of the request.
 * @param {string} request.query.business_account - The business account ID to filter active automation rules.
 * @param {FastifyResponse} reply
 *
 * @returns {Promise<void>}
 */

async function handler(request, reply) {
  const { business_account } = request.query;

  const activeAutomationRuleCount = await c.automationRule.count(
    {
      status: "active",
    },
    {
      include: [
        {
          model: models.automation_rule_template,
          where: {
            business_account: business_account,
          },
        },
      ],
    }
  );
  const wabaDetails = await c.agencyWhatsAppConfig.findOne({
    agency_whatsapp_config_id: business_account
  })

  try {
    h.api.createResponse(
      request,
      reply,
      200,
      {
        activeAutomationRuleCount,
        wabaNumber: wabaDetails?.waba_number
      },
      "automation-rules-1727767003373-active-count-success"
    );
  } catch (err) {
    Sentry.captureException(err);
    request.log.error({
      error: err,
      url: "/staff/automation/active-count"
    });
    h.api.createResponse(
      request,
      reply,
      500,
      {},
      "automation-rules-1727767003373-active-count-failed"
    );
  }
}

module.exports.handler = handler;
