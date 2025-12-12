const Sentry = require('@sentry/node');
const constant = require('../../constants/constant.json');
const c = require('../../controllers');
const h = require('../../helpers');
const userMiddleware = require('../../middlewares/user');

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/task-message Create task message
   * @apiName TaskMessageCreate
   * @apiVersion 1.0.0
   * @apiGroup Task
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} subject Subject
   * @apiParam {string} type Type
   * @apiParam {string} type_sub Sub type
   * @apiParam {string} message Message
   */
  fastify.route({
    method: 'POST',
    url: '/task/message',
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
                type: constant.TASK.MESSAGE.TYPE.CLIENT_TO_STAFF,
                message,
                created_by: user_id,
              },
              { transaction },
            );
            await c.task.update(
              task_id,
              {
                status: constant.TASK.STATUS.PENDING_STAFF,
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
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to create task`, { err });
        h.api.createResponse(request, reply, 500, {}, '2-task-1611375834526');
      }
    },
  });

  next();
};
