const userMiddleware = require('../../../../middlewares/user');

const getAutomationCategories = require('./getAutomationCategories');
const getAutomationCategoryById = require('./getAutomationCategoryById');
const postAutomationCategories = require('./postAutomationCategories');
const deleteAutomationCategories = require('./deleteAutomationCategories');
const getAutomationRules = require('./getAutomationRules');
const getAutomationRulesByCategoryId = require('./getAutomationRulesByCategoryId');
const getAutomationRuleByAutomationRuleId = require('./getAutomationRuleByAutomationRuleId');
const updateAutomationRuleByAutomationRuleId = require('./updateAutomationRuleByAutomationRuleId');
const updateAutomationRuleByAutomationRuleIdV2 = require('./updateAutomationRuleByAutomationRuleIDV2');
const deleteAutomationRuleByAutomationRuleId = require('./deleteAutomationRuleByAutomationRuleId');
const getAutomationPackages = require('./getAutomationPackages');
const getAutomationFormsByAgency = require('./getAutomationFormsByAgency');
const getAutomationRuleTriggerByPlatform = require('./getAutomationRuleTriggersByPlatform');
const postAutomationRules = require('./postAutomationRules');
const getAutomationRun = require('./getAutomationRun');
const getAutomationRuleOnce = require('./getAutomationRuleOnce');
const postAutomationRunImmediate = require('./postAutomationRunImmediate');
const getAutomationSyncContacts = require('./getAutomationSyncContacts');
const getAutomationCheckWebhook = require('./getAutomationCheckWebhook');
const getAutoInsightByAgencyAndRule = require('./getAutoInsightByAgencyAndRule');
const getAutoRecipientsByAgencyAndRule = require('./getAutoRecipientsByAgencyAndRule');
const getAutomationRunHubspotChecker = require('./getAutomationRunHubspotChecker');
const getAutoRunSubscriptionWebhook = require('./getAutoRunSubscriptionWebhook');
const updateAutoRuleStatusByAutomationRuleId = require('./updateAutoRuleStatusByAutomationRuleId');
const updateAutoRuleFlowDataByRuleId = require('./updateAutoRuleFlowDataByRuleId');
const getActiveAutomationCount = require('./getActiveAutomationCount');

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'GET',
    url: '/staff/automation/categories',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: getAutomationCategories.handler,
  });

  fastify.route({
    method: 'GET',
    url: '/staff/automation/categories/:automation_category_id',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: getAutomationCategoryById.handler,
  });

  /** Create automation categories */
  fastify.route({
    method: 'POST',
    url: '/staff/automation/categories',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: postAutomationCategories.handler,
  });

  /** Delete automation categories */
  fastify.route({
    method: 'DELETE',
    url: '/staff/automation/categories',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: deleteAutomationCategories.handler,
  });

  /** Get automation All Rules */
  fastify.route({
    method: 'GET',
    url: '/staff/automation/rules',
    schema: {
      params: {
        tracker_ref_name: { type: 'string' },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: getAutomationRules.handler,
  });

  /** Get automation Rules */
  fastify.route({
    method: 'GET',
    url: '/staff/automation/rules/:category_id',
    schema: {
      params: {
        tracker_ref_name: { type: 'string' },
      },
      querystring: {
        rule_trigger_fk: { type: 'string' },
        business_account: {type: 'string'},
        status: {type: 'string'}
      }
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: getAutomationRulesByCategoryId.handler,
  });

  /** Get automation Rules */
  fastify.route({
    method: 'GET',
    url: '/staff/automation/rule/:automation_rule_id',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: getAutomationRuleByAutomationRuleId.handler,
  });

  /** update automation Rules */
  fastify.route({
    method: 'PUT',
    url: '/staff/automation/rule/:automation_rule_id',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: updateAutomationRuleByAutomationRuleId.handler,
  });

  fastify.route({
    method: 'PUT',
    url: '/staff/automation/rule/:automation_rule_id/v2',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: updateAutomationRuleByAutomationRuleIdV2.handler,
  });

  fastify.route({
    method: 'PUT',
    url: '/staff/automation/rule/:automation_rule_id/template/:automation_rule_template_id/flow-data',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    schema: updateAutoRuleFlowDataByRuleId.schema,
    handler: updateAutoRuleFlowDataByRuleId.handler,
  });

  /** Delete automation rule */
  fastify.route({
    method: 'DELETE',
    url: '/staff/automation/rule/:automation_rule_id',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: deleteAutomationRuleByAutomationRuleId.handler,
  });

  /** Get Packages */
  fastify.route({
    method: 'GET',
    url: '/staff/automation/packages',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: getAutomationPackages.handler,
  });

  fastify.route({
    method: 'GET',
    url: '/staff/automation/forms/:agency_fk',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: getAutomationFormsByAgency.handler,
  });

  /** Get Rule Trigger */
  fastify.route({
    method: 'GET',
    url: '/staff/automation/rule-triggers/:platform',
    handler: getAutomationRuleTriggerByPlatform.handler,
  });

  /** Save Rule Trigger */
  fastify.route({
    method: 'POST',
    url: '/staff/automation/rules',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    schema: postAutomationRules.schema,
    handler: postAutomationRules.handler,
  });

  /** Run Automation */
  fastify.route({
    method: 'GET',
    url: '/staff/automation/run',

    handler: getAutomationRun.handler,
  });

  /** Run Automation */
  fastify.route({
    method: 'GET',
    url: '/staff/automation/run-once',

    handler: getAutomationRuleOnce.handler,
  });

  /** Run Automation */
  fastify.route({
    method: 'POST',
    url: '/staff/automation/run/immediate',
    handler: postAutomationRunImmediate.handler,
  });

  /** Run Automation */
  fastify.route({
    method: 'GET',
    url: '/staff/automation/sync-contacts',

    handler: getAutomationSyncContacts.handler,
  });

  /** Run Webhook Checker */
  fastify.route({
    method: 'GET',
    url: '/staff/automation/check-webhook',

    handler: getAutomationCheckWebhook.handler,
  });

  /** Get automation history and insights */
  fastify.route({
    method: 'GET',
    url: '/staff/automation/insight/:agency_id/:automation_rule_id',
    schema: getAutoInsightByAgencyAndRule.schema,
    handler: getAutoInsightByAgencyAndRule.handler,
  });

  /** Get automation history recipients */
  fastify.route({
    method: 'GET',
    url: '/staff/automation/recipients/:agency_id/:automation_rule_id',
    schema: getAutoRecipientsByAgencyAndRule.schema,
    handler: getAutoRecipientsByAgencyAndRule.handler,
  });

  fastify.route({
    method: 'GET',
    url: '/staff/automation/run-hubspot-response-checker',
    handler: getAutomationRunHubspotChecker.handler,
  });

  fastify.route({
    method: 'GET',
    url: '/staff/automation/run-subscription-webhook',
    handler: getAutoRunSubscriptionWebhook.handler,
  });

  fastify.route({
    method: 'GET',
    url: '/staff/automation/active-count',
    schema: {
      querystring: {
        business_account: {type: 'string'}
      }
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: getActiveAutomationCount.handler,
  });

  /** update automation Rule status */
  fastify.route({
    method: 'PUT',
    url: '/staff/automation/rule/status/:automation_rule_id',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: updateAutoRuleStatusByAutomationRuleId.handler,
  });

  next();
};
