const Sentry = require('@sentry/node');
const h = require('../../../../helpers');
const c = require('../../../../controllers');

/**
 * Deletes an automation rule and its associated templates and packages by rule ID.
 *
 * This API endpoint deletes the specified automation rule along with any related
 * rule templates and rule packages.
 *
 * @async
 * @function handler
 * @param {FastifyRequest} request
 * @param {Object} request.params - The parameters of the request.
 * @param {string} request.params.automation_rule_id - The ID of the automation rule to delete.
 * @param {FastifyResponse} reply
 *
 * @returns {Promise<void>}
 */
async function handler (request, reply) {
  const { automation_rule_id } = request.params;

  await h.database.transaction(async (transaction) => {
    // Delete rule
    await c.automationRule.destroy(
      {
        automation_rule_id: automation_rule_id,
      },
      { transaction },
    );

    // Delete rule templates
    await c.automationRuleTemplate.destroyAll(
      {
        automation_rule_fk: automation_rule_id,
      },
      { transaction },
    );

    // Delete rule packages
    await c.automationRulePackage.destroyAll(
      {
        automation_rule_fk: automation_rule_id,
      },
      { transaction },
    );
  });

  try {
    h.api.createResponse(
      request,
      reply,
      200,
      {},
      'automation-rule-1689818819-delete-success',
    );
  } catch (err) {
    Sentry.captureException(err);
    request.log.error({
      error: err,
      error_string: String(err),
      url: "/staff/automation/rule/:automation_rule_id"
    });
    h.api.createResponse(
      request,
      reply,
      500,
      {},
      'automation-rule-1689818819-delete-failed',
    );
  }
}

module.exports.handler = handler;
