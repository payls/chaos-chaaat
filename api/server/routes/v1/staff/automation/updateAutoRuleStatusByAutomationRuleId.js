const Sentry = require('@sentry/node');
const models = require('../../../../models');
const h = require('../../../../helpers');
const c = require('../../../../controllers');

/**
 * Handler for updating the status of an automation rule.
 * 
 * This function processes a request to update the status of an automation rule. It checks whether all messages and 
 * bookings are approved or published before allowing the automation rule to be activated. If any message or booking 
 * is not approved or published, the automation rule cannot be activated.
 * 
 * @async
 * @function handler
 * @param {FastifyRequest} request - The incoming HTTP request object containing the parameters and body.
 * @param {FastifyReply} reply - The response object used to send the result back to the client.
 * @returns {Promise<void>}
 */

async function handler (request, reply) {
  const { automation_rule_id } = request.params;
  const { status } = request.body;

  const isLegacy = request.query.isLegacy && request.query.isLegacy === 'true';

  const ruleObj = await c.automationRule.findOne(
    {
      automation_rule_id,
    },
    {
      include: [
        {
          model: models.automation_rule_template,
        },
        {
          model: models.automation_rule_packages,
        },
      ],
    }
  );

  let areAllMessageApproved = true;
  let areAllBookingPublished = true;
  let bookings = [];
  let messages = [];

  const messageFlow = JSON.parse(
    ruleObj.automation_rule_templates[0].message_flow_data
  );

  if (!isLegacy) {
    messages = messageFlow.nodes.filter(
      (ele) =>
        ele.type === "message" &&
        ele.data?.flowData?.method === "custom" &&
        ele.data?.flowData?.customSelected !== "simple-text"
    );
    bookings = messageFlow.nodes.filter((ele) => ele.type === "booking");
  
    areAllMessageApproved = messages.every((node) =>
      h.cmpStr(node.data.flowData?.status, "APPROVED")
    );
  
    areAllBookingPublished = bookings.every((node) =>
      h.cmpStr(node.data.flowData?.status, "published")
    );
  }

  // if a booking or template is not approved, user should not be allowed to activate the Automation
  if (
    ((messages.length && h.cmpBool(areAllMessageApproved, false)) ||
      (bookings.length && h.cmpBool(areAllBookingPublished, false))) &&
    h.cmpBool(isLegacy, false) &&
    h.cmpStr(status, "active")
  ) {
    return h.api.createResponse(
      request,
      reply,
      400,
      {
        message:
          "Cannot activate automation: Please ensure the booking/template is approved.",
      },
      "automation-rules-1689818819-update-failed"
    );
  }

  await h.database.transaction(async (transaction) => {
    await c.automationRule.update(
      automation_rule_id,
      {
        status,
      },
      { transaction }
    );
  });

  try {
    h.api.createResponse(
      request,
      reply,
      200,
      {
        ruleObj,
      },
      "automation-rules-1689818819-update-success"
    );
  } catch (err) {
    Sentry.captureException(err);
    request.log.error({
      error: err,
      url: "/staff/automation/rule/status/:automation_rule_id"
    });
    h.api.createResponse(
      request,
      reply,
      500,
      {},
      "automation-rules-1689818819-update-failed"
    );
  }
}

module.exports.handler = handler;
