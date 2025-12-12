const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const {
  task_message: taskMessageModel,
  user: userModel,
} = require('../../../models');
const c = require('../../../controllers');
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/staff/task Create task
   * @apiName StaffTaskCreate
   * @apiVersion 1.0.0
   * @apiGroup Staff Task
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} user_id User ID of client
   * @apiParam {string} subject Subject
   * @apiParam {string} type Type
   * @apiParam {string} type_sub Sub type
   * @apiParam {string} message Message
   */
  fastify.route({
    method: 'POST',
    url: '/staff/task',
    schema: {
      body: {
        type: 'object',
        required: ['client_user_id', 'subject', 'type', 'type_sub', 'message'],
        properties: {
          client_user_id: { type: 'string' },
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
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      try {
        const { client_user_id, subject, type, type_sub, message } =
          request.body;
        const { user_id } = h.user.getCurrentUser(request);
        const { task_id, task_message_id } = await h.database.transaction(
          async (transaction) => {
            const task_id = await c.task.create(
              {
                owner_type: constant.OWNER.TYPE.SERVICE_PROVIDER,
                owner_fk: user_id,
                subject,
                type,
                type_sub,
                status: constant.TASK.STATUS.PENDING_CLIENT,
                created_by: user_id,
              },
              { transaction },
            );
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
            const task_permission_id = await c.taskPermission.create(
              {
                task_fk: task_id,
                owner_type: constant.OWNER.TYPE.CLIENT,
                owner_fk: client_user_id,
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
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        request.log.error({
          err,
          url: request?.url,
        });
        h.api.createResponse(request, reply, 500, {}, '2-task-1611375834526', {
          portal,
        });
      }
    },
  });

  /**
   * @api {get} /v1/staff/task Get tasks
   * @apiName StaffTaskGetTasks
   * @apiVersion 1.0.0
   * @apiGroup Staff Task
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/task',
    schema: {
      query: {
        status: { type: 'string' },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
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
            // include: [{
            // 	model: taskPermissionModel,
            // 	required: true
            // },
            // {
            // 	model: taskMessageModel,
            // 	as: 'task_message',
            // 	attributes: ['task_fk'],
            // 	required: true,
            // 	limit: 1
            // }
            // ]
          },
        );
        h.api.createResponse(
          request,
          reply,
          200,
          { tasks },
          '1-task-1610880791311',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        request.log.error({
          err,
          url: request?.url,
        });
        h.api.createResponse(request, reply, 500, {}, '2-task-1610880838338', {
          portal,
        });
      }
    },
  });

  /**
   * @api {get} /v1/staff/task Get task
   * @apiName StaffTaskGetSingleTask
   * @apiVersion 1.0.0
   * @apiGroup Staff Task
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/task/:task_id',
    schema: {
      params: {
        task_id: { type: 'string' },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      try {
        const { task_id } = request.params;
        const task = await c.task.findOne(
          { task_id },
          {
            include: [
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
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        request.log.error({
          err,
          url: request?.url,
        });
        h.api.createResponse(request, reply, 500, {}, '2-task-1610672848565', {
          portal,
        });
      }
    },
  });

  /**
   * @api {post} /v1/staff/task Complete task
   * @apiName StaffTaskCompleteTask
   * @apiVersion 1.0.0
   * @apiGroup Staff Task
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'POST',
    url: '/staff/task/complete',
    schema: {
      body: {
        type: 'object',
        required: ['task_id'],
        properties: {
          task_id: { type: 'string' },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      try {
        const { task_id } = request.body;
        await c.task.update(task_id, {
          status: constant.TASK.STATUS.COMPLETED,
        });
        h.api.createResponse(
          request,
          reply,
          200,
          { task_id },
          '1-task-1611505237506',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        request.log.error({
          err,
          url: request?.url,
        });
        h.api.createResponse(request, reply, 500, {}, '2-task-1611505259663', {
          portal,
        });
      }
    },
  });

  /**
   * @api {post} /v1/staff/task Restore task
   * @apiName StaffTaskRestoreTask
   * @apiVersion 1.0.0
   * @apiGroup Staff Task
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'POST',
    url: '/staff/task/restore',
    schema: {
      body: {
        type: 'object',
        required: ['task_id'],
        properties: {
          task_id: { type: 'string' },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      try {
        const { task_id } = request.body;
        await c.task.update(task_id, {
          status: constant.TASK.STATUS.PENDING_STAFF,
        });
        h.api.createResponse(
          request,
          reply,
          200,
          { task_id },
          '1-task-1611505711318',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        request.log.error({
          err,
          url: request?.url,
        });
        h.api.createResponse(request, reply, 500, {}, '2-task-1611505727549', {
          portal,
        });
      }
    },
  });

  next();
};
