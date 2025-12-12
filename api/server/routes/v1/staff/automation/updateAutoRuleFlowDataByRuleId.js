const Sentry = require('@sentry/node');
const models = require('../../../../models');
const h = require('../../../../helpers');
const c = require('../../../../controllers');
const constant = require('../../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP;

const schema = {
  params: {
    type: 'object',
    required: ['automation_rule_id', 'automation_rule_template_id'],
    properties: {
      automation_rule_id: { type: 'string' },
      automation_rule_template_id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['nodes', 'edges'],
    properties: {
      nodes: {
        type: 'array',
        items: { type: 'object' },
      },
      edges: {
        type: 'array',
        items: { type: 'object' },
      },
    }
  },
};

/** Handler for updating the message flow data in the automation rule template.
* 
* This function processes a request to update the message flow data (nodes and edges) of a specific automation rule
* template

* @async
* @function handler
* @param {FastifyRequest} request
* @param {FastifyReply} reply
* @returns {Promise<void>} Sends a response with a success or failure message.
* 
*/

async function handler (request, reply) {
  const { automation_rule_id, automation_rule_template_id } = request.params;
  const { nodes, edges } = request.body;

  try {
    const isRuleTemplateExists = await c.automationRuleTemplate.findOne({
      automation_rule_fk: automation_rule_id,
      automation_rule_template_id,
    });
  
    if (!isRuleTemplateExists) {
      return h.api.createResponse(
        request,
        reply,
        400,
        {
          message: 'Invalid Automation Rule Template ID'
        },
        '2-update-automation-rule-template-flow-data-1722316217000',
      );
    }
  
    await c.automationRuleTemplate.update(automation_rule_template_id, {
      message_flow_data: JSON.stringify({
        nodes,
        edges,
      }),
    });
  
    return h.api.createResponse(
      request,
      reply,
      200,
      {
        automation_rule_id,
        automation_rule_template_id,
        message: 'Successfully Updated Message Flow Data',
        status: 'ok',
      },
      '1-update-automation-rule-template-flow-data-1722316217000',
      { portal },
    );
  } catch (error) {
    Sentry.captureException(error);
    request.log.error({
      error: error,
      url: "/staff/automation/rule/:automation_rule_id/template/:automation_rule_template_id/flow-data"
    });
    h.api.createResponse(
      request,
      reply,
      500,
      {},
      '2-update-automation-rule-template-flow-data-1722316217000',
    );
  }
}

module.exports.schema = schema;
module.exports.handler = handler;
