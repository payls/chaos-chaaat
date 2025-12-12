const Sentry = require('@sentry/node');
const constant = require('../../constants/constant.json');
const {
  task_permission: taskPermissionModel,
  task_message: taskMessageModel,
  user: userModel,
} = require('../../models');
const c = require('../../controllers');
const h = require('../../helpers');
const userMiddleware = require('../../middlewares/user');

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/task Create task
   * @apiName TaskCreate
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
    url: '/task',
    schema: {
      body: {
        type: 'object',
        required: ['subject', 'type', 'type_sub', 'message'],
        properties: {
          subject: { type: 'string' },
          type: { type: 'string' },
          type_sub: { type: 'string' },
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
    },
    handler: async (request, reply) => {
      try {
        const { subject, type, type_sub, message } = request.body;
        const { user_id } = h.user.getCurrentUser(request);
        const { task_id, task_message_id } = await h.database.transaction(
          async (transaction) => {
            const task_id = await c.task.create(
              {
                owner_type: constant.OWNER.TYPE.CLIENT,
                owner_fk: user_id,
                subject,
                type,
                type_sub,
                status: constant.TASK.STATUS.PENDING_STAFF,
                created_by: user_id,
              },
              { transaction },
            );
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
            const task_permission_id = await c.taskPermission.create(
              {
                task_fk: task_id,
                owner_type: constant.OWNER.TYPE.CLIENT,
                owner_fk: user_id,
                action: constant.PERMISSION.ACTION.VIEW,
                permission: 1,
              },
              { transaction },
            );
            return { task_id, task_message_id, task_permission_id };
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

  /**
   * @api {get} /v1/task Get tasks
   * @apiName TaskGetTasks
   * @apiVersion 1.0.0
   * @apiGroup Task
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/task',
    schema: {
      query: {
        status: { type: 'string' },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
    },
    handler: async (request, reply) => {
      try {
        const { status } = request.query;
        h.validation.validateConstantValue(
          'GET /task',
          { status: constant.TASK.STATUS },
          { status },
        );
        const tasks = await c.task.findAll(
          { status },
          {
            include: [
              {
                model: taskPermissionModel,
                required: true,
              },
              // {
              // 	model: taskMessageModel,
              // 	as: 'task_message',
              // 	attributes: ['task_fk'],
              // 	required: true,
              // 	limit: 1
              // }
            ],
          },
        );
        h.api.createResponse(
          request,
          reply,
          200,
          { tasks },
          '1-task-1610880791311',
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to retrieve tasks`, { err });
        h.api.createResponse(request, reply, 500, {}, '2-task-1610880838338');
      }
    },
  });

  /**
   * @api {get} /v1/task Get task
   * @apiName TaskGetSingleTask
   * @apiVersion 1.0.0
   * @apiGroup Task
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/task/:task_id',
    schema: {
      params: {
        task_id: { type: 'string' },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToTask(request, reply);
    },
    handler: async (request, reply) => {
      try {
        const { task_id } = request.params;
        const task = await c.task.findOne(
          { task_id },
          {
            include: [
              { model: taskPermissionModel, required: true },
              {
                model: taskMessageModel,
                required: true,
                include: [{ model: userModel, required: true }],
              },
            ],
            order: [[taskMessageModel, 'created_date', 'ASC']],
          },
        );
        h.api.createResponse(
          request,
          reply,
          200,
          { task },
          '1-task-1610672817713',
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to retrieve task`, { err });
        h.api.createResponse(request, reply, 500, {}, '2-task-1610672848565');
      }
    },
  });

  next();
};
