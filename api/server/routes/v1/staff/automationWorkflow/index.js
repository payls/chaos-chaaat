const requestWorkflowApproval = require("./requestWorkflowApproval");

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/staff/automation/workflow/request-approval
   */
  fastify.route({
    method: "POST",
    url: "/staff/automation/workflow/request-approval",
    schema: requestWorkflowApproval.schema,
    preValidation: requestWorkflowApproval.preValidation,
    handler: requestWorkflowApproval.handler,
  });

  return next();
};
