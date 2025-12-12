const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const c = require('../../../controllers');
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/staff/task-message Create task message
   * @apiName StaffTaskMessageCreate
   * @apiVersion 1.0.0
   * @apiGroup Staff Task
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} task_id Task ID
   * @apiParam {string} message Message
   */
  fastify.route({
    method: 'POST',
    url: '/staff/task/message',
    schema: {
      body: {
        type: 'object',
        required: ['task_id', 'message'],
        properties: {
          task_id: { type: 'string' },
          message: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            task_id: { type: 'string' },
            task_message_id: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToTask(request, reply);
    },
    handler: async (request, reply) => {
      try {
        const { task_id, message } = request.body;
        const { user_id } = h.user.getCurrentUser(request);
        const { task_message_id } = await h.database.transaction(
          async (transaction) => {
            const task_message_id = await c.taskMessage.create(
              {
                task_fk: task_id,
                user_fk: user_id,
                type: constant.TASK.MESSAGE.TYPE.STAFF_TO_CLIENT,
                message,
                created_by: user_id,
              },
              { transaction },
            );
            await c.task.update(
              task_id,
              {
                status: constant.TASK.STATUS.PENDING_CLIENT,
                status_updated_date: h.date.getSqlCurrentDate(),
              },
              { transaction },
            );
            return { task_message_id };
          },
        );
        h.api.createResponse(
          request,
          reply,
          200,
          { task_id, task_message_id },
          '1-task-1611375816784',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to create task`, { err });
        h.api.createResponse(request, reply, 500, {}, '2-task-1611375834526', {
          portal,
        });
      }
    },
  });

  next();
};
