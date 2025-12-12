const whatsappFlowCreate = require('./whatsappFlowCreate');
const whatsappFlowUpdate = require('./whatsappFlowUpdate');
const whatsappFlowDelete = require('./whatsappFlowDelete');
const whatsappFlowArchive = require('./whatsappFlowArchive');
const whatsappFlowDeleteByCrmSettingsId = require('./whatsappFlowDeleteByCrmSettingsId');
const whatsappFlowGetById = require('./whatsappFlowGetById');
const whatsappFlowRegisterKey = require('./whatsappFlowRegisterKey');

module.exports = (fastify, opts, next) => {

  /**
   * @api {post} /v1/staff/whatsapp-flows Staff create WA flow
   * @apiName StaffWhatsAppFlowCreate
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccessExample {json} Success 200 Response:
   */
  fastify.route({
    method: 'POST',
    url: '/staff/whatsapp-flows/create',
    schema: whatsappFlowCreate.schema,
    preValidation: whatsappFlowCreate.preValidation,
    handler: whatsappFlowCreate.handler,
  });

  /**
   * @api {post} /v1/staff/whatsapp-flows/:flow_id Staff update WA flow
   * @apiName StaffWhatsAppFlowUpdate
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccessExample {json} Success 200 Response:
   */
  fastify.route({
    method: 'PUT',
    url: '/staff/whatsapp-flows/:whatsapp_flow_id',
    schema: whatsappFlowUpdate.schema,
    preValidation: whatsappFlowUpdate.preValidation,
    handler: whatsappFlowUpdate.handler,
  });

  /**
   * @api {get} /v1/staff/whatsapp-flows/:flow_id Staff update WA flow
   * @apiName StaffWhatsAppFlowGetByID
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccessExample {json} Success 200 Response:
   */
  fastify.route({
    method: 'GET',
    url: '/staff/whatsapp-flows/:whatsapp_flow_id',
    preValidation: whatsappFlowUpdate.preValidation,
    handler: whatsappFlowGetById.handler,
  });

  /**
   * @api {post} /staff/whatsapp-flows/:whatsapp_flow_id/delete Staff update WA flow
   * @apiName StaffWhatsAppFlowDelete
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccessExample {json} Success 200 Response:
   */
  fastify.route({
    method: 'POST',
    url: '/staff/whatsapp-flows/:whatsapp_flow_id/delete',
    schema: whatsappFlowDelete.schema,
    preValidation: whatsappFlowDelete.preValidation,
    handler: whatsappFlowDelete.handler,
  });

  /**
   * @api {post} /staff/whatsapp-flows/:crm_settings_id/delete-by-crm-settings-id Staff update WA flow
   * @apiName StaffWhatsAppFlowDelete
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccessExample {json} Success 200 Response:
   */
    fastify.route({
      method: 'POST',
      url: '/staff/whatsapp-flows/:crm_settings_id/delete-by-crm-settings-id',
      schema: whatsappFlowDeleteByCrmSettingsId.schema,
      preValidation: whatsappFlowDeleteByCrmSettingsId.preValidation,
      handler: whatsappFlowDeleteByCrmSettingsId.handler,
    });
  

  /**
   * @api {post} /staff/whatsapp-flows/:whatsapp_flow_id/archive Staff update WA flow
   * @apiName StaffWhatsAppFlowArchive
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccessExample {json} Success 200 Response:
   */
  fastify.route({
    method: 'POST',
    url: '/staff/whatsapp-flows/:whatsapp_flow_id/archive',
    schema: whatsappFlowArchive.schema,
    preValidation: whatsappFlowArchive.preValidation,
    handler: whatsappFlowArchive.handler,
  });

  /**
   * @api {post} /staff/whatsapp-flows/register-key Register Key
   * @apiName StaffWhatsAppFlowArchive
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccessExample {json} Success 200 Response:
   */
  fastify.route({
    method: 'POST',
    url: '/staff/whatsapp-flows/register-key',
    schema: whatsappFlowRegisterKey.schema,
    preValidation: whatsappFlowRegisterKey.preValidation,
    handler: whatsappFlowRegisterKey.handler,
  });

  return next();
};
