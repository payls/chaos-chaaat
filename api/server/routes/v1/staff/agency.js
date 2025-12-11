const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const moment = require('moment');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const c = require('../../../controllers');
const h = require('../../../helpers');
const models = require('../../../models');
const userMiddleware = require('../../../middlewares/user');
const agencyMiddleware = require('../../../middlewares/agency');
const { Op, Sequelize } = require('sequelize');
const config = require('../../../configs/config')(process.env.NODE_ENV);
const axios = require('axios');

module.exports = (fastify, opts, next) => {
  /**
   * @api {get} /v1/staff/agency Super admin staff to get list of all agencies
   * @apiName StaffAgencyGetAgencies
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object[]} agencies List of agencies
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "agencies": []
   * }
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            agencies: { type: 'array' },
          },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAgencyAdminPermission(req, res);
    },
    handler: async (req, res) => {
      try {
        const agencies = await c.agency.findAll({});
        h.api.createResponse(
          req,
          res,
          200,
          { agencies },
          '1-agency-1622176002',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(req, res, 500, {}, '2-agency-1622176015', {
          portal,
        });
      }
    },
  });

  /**
   * @api {get} /v1/staff/agency/:agency_id Super admin staff to get single agency
   * @apiName StaffAgencyGetAgency
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency/:agency_id',
    schema: {
      params: {
        agency_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAgencyAdminPermission(req, res);
    },
    handler: async (req, res) => {
      try {
        const { agency_id } = req.params;
        const agency = await c.agency.findOne({ agency_id });
        h.api.createResponse(req, res, 200, { agency }, '1-agency-1622176515', {
          portal,
        });
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(req, res, 500, {}, '2-agency-1622176528', {
          portal,
        });
      }
    },
  });

  /**
   * @api {post} /v1/staff/agency Super admin staff to create agency
   * @apiName StaffAgencyCreate
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency
   * @apiUse ServerError
   *
   * @apiParam {string} agency_name Agency name
   * @apiParam {string} agency_logo_url Agency logo url
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} agency_id Agency id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "agency_id": "1234",
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/staff/agency',
    schema: {
      body: {
        type: 'object',
        required: ['agency_name'],
        properties: {
          agency_name: { type: 'string' },
          agency_logo_url: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            agency_id: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAgencyAdminPermission(req, res);
    },
    handler: async (req, res) => {
      try {
        const { agency_name, agency_logo_url } = req.body;
        const { user_id } = h.user.getCurrentUser(req);
        const { agency_id } = h.database.transaction(async (transaction) => {
          const agency_id = await c.agency.create(
            {
              agency_name,
              agency_logo_url,
              created_by: user_id,
            },
            { transaction },
          );
          return { agency_id };
        });
        h.api.createResponse(
          req,
          res,
          200,
          { agency_id },
          '1-agency-1622178043',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${req.url}: user failed to create agency`, { err });
        h.api.createResponse(req, res, 500, {}, '2-agency-1622178049', {
          portal,
        });
      }
    },
  });

  /**
   * @api {put} /v1/staff/agency Super admin staff to update agency
   * @apiName StaffAgencyUpdate
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency
   * @apiUse ServerError
   *
   * @apiParam {string} agency_id Agency ID
   * @apiParam {string} agency_name Agency name
   * @apiParam {string} agency_logo_url Agency logo url
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} agency_id Agency id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "agency_id": "1234"
   * }
   */
  fastify.route({
    method: 'PUT',
    url: '/staff/agency',
    schema: {
      body: {
        type: 'object',
        required: ['agency_id'],
        properties: {
          agency_id: { type: 'string' },
          agency_name: { type: 'string' },
          agency_logo_url: { type: 'string' },
          agency_logo_whitebg_url: { type: 'string' },
          agency_subdomain: { type: 'string' },
          agency_campaign_additional_recipient: { type: 'string' },
          campaign_approval_agent: { type: 'string' },
          default_outsider_contact_owner: { type: 'string' },
          hubspot_id: { type: 'string' },
          campaign_notification_disable: { type: 'boolean' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            agency_id: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAgencyAdminPermission(req, res);
    },
    handler: async (req, res) => {
      try {
        const {
          agency_id,
          agency_name,
          agency_logo_url,
          agency_logo_whitebg_url,
          agency_subdomain,
          agency_campaign_additional_recipient,
          campaign_approval_agent,
          default_outsider_contact_owner,
          hubspot_id,
          campaign_notification_disable,
        } = req.body;
        const { user_id } = h.user.getCurrentUser(req);

        const updatedAgencyId = await h.database.transaction(
          async (transaction) => {
            const updatedAgencyId = await c.agency.update(
              agency_id,
              {
                agency_name,
                agency_logo_url,
                updated_by: user_id,
                agency_logo_whitebg_url,
                agency_subdomain,
                agency_campaign_additional_recipient,
                campaign_approval_agent,
                default_outsider_contact_owner,
                hubspot_id,
                campaign_notification_disable,
              },
              { transaction },
            );
            return updatedAgencyId;
          },
        );
        h.api.createResponse(
          req,
          res,
          200,
          { contact_id: updatedAgencyId },
          '1-agency-1622181696',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${req.url}: user failed to update agency record`, { err });
        h.api.createResponse(req, res, 500, {}, '2-agency-1622181716', {
          portal,
        });
      }
    },
  });

  /**
   * @api {delete} /v1/staff/agency Super admin staff to delete agency record by agency ID
   * @apiName StaffAgencyDelete
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} agency_id Agency ID
   */
  fastify.route({
    method: 'DELETE',
    url: '/staff/agency',
    schema: {
      querystring: {
        agency_id: { type: 'string' },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasStaffAdminPermission(req, res);
    },
    handler: async (req, res) => {
      try {
        const { agency_id } = req.query;
        await h.database.transaction(async (transaction) => {
          return await c.agency.destroy({ agency_id }, { transaction });
        });
        h.api.createResponse(req, res, 200, {}, '1-agency-1622182797', {
          portal,
        });
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${req.url}: user failed to delete agency`, { err });
        h.api.createResponse(req, res, 500, {}, '2-agency-1622182815', {
          portal,
        });
      }
    },
  });

  /**
   * @api {get} /v1/staff/agency/custom-properties Get list of custom properties and values of an agency
   * @apiName StaffAgencyGetCustomProperties
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object[]} customProperties list of custom properties of agency
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "agencies": []
   * }
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency/custom-properties',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            customProperties: { type: 'array' },
          },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      try {
        const { user_id: current_user_id } = h.user.getCurrentUser(req);
        const { agency_fk } = await c.agencyUser.findOne({
          user_fk: current_user_id,
        });

        const customProperties = await c.contactPropertyDefinitions.findAll(
          {
            agency_fk,
          },
          {
            include: [
              { model: models.contact_property_values, required: true },
            ],
          },
        );

        const attributeValueKeys = {
          string: 'attribute_value_string',
          int: 'attribute_value_int',
          date: 'attribute_value_date',
        };

        for (const property of customProperties) {
          const attributeType = property.attribute_type;
          const values = property.dataValues.contact_property_values;
          const deduplicateReducer = (prev, curr) => {
            const attributeValueKey = attributeValueKeys[attributeType];
            for (const prevValue of prev) {
              if (prevValue[attributeValueKey] === curr[attributeValueKey]) {
                return prev;
              }
            }
            prev.push(curr);
            return prev;
          };
          property.dataValues.contact_property_values = values.reduce(
            deduplicateReducer,
            [],
          );
        }

        h.api.createResponse(
          req,
          res,
          200,
          { customProperties },
          '1-agency-1622192413',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(req, res, 500, {}, '2-agency-1622192413', {
          portal,
        });
      }
    },
  });

  /**
   * @api {get} /v1/staff/agency/:agency_id/campaign-performance/:tracker_ref_name Get agency campaign performance
   * @apiName StaffAgencyCampaignPerformance
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object[]} agency_performance list of agency campaign performance data
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *    "agency_performance": {
   *        "cta": {
   *            "0": 1,
   *            "1": 0,
   *            "2": 1
   *        },
   *        "manual_replies": 3,
   *        "proposal_opened": 0,
   *        "delivered": 1
   *    },
   *    "status": "ok",
   *    "message": "Retrieved campaign performance successfully",
   *    "message_code": "1-agency-campaign-performance-1622176515"
   *}
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency/:agency_id/campaign-performance/:tracker_ref_name',
    schema: {
      params: {
        agency_id: { type: 'string' },
        tracker_ref_name: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      try {
        const { agency_id, tracker_ref_name } = req.params;
        const agency = await c.agency.findOne({ agency_id });
        const { whatsapp_config } = await models.agency_config.findOne({
          where: { agency_fk: agency_id },
        });

        const cta = await models.campaign_cta.findOne({
          where: { campaign_tracker_ref_name: tracker_ref_name },
        });

        const agency_performance = {
          cta: {},
          batch_count: 0,
          manual_replies: 0,
          pending: 0,
          og_failed: 0,
          failed: 0,
          sent: 0,
          delivered: 0,
          read: 0,
        };
        if (!h.isEmpty(whatsapp_config)) {
          const config = JSON.parse(whatsapp_config);
          const quick_replies = config.quick_replies;
          const message_tracker = await models.whatsapp_message_tracker.findOne(
            {
              where: {
                tracker_ref_name: tracker_ref_name,
              },
            },
          );
          const broadcast_date = new Date(message_tracker.broadcast_date);
          agency_performance.batch_count = message_tracker.batch_count;

          if (!h.isEmpty(cta)) {
            for (let cta_index = 0; cta_index < 10; cta_index++) {
              if (h.notEmpty(cta[`cta_${cta_index + 1}`])) {
                let cta_text = h.whatsapp.sanitizeData(cta[`cta_${cta_index + 1}`]);
                cta_text = h.whatsapp.replaceMultiple(cta_text, {
                  "&": "&amp;",
                });
                const cta_count = await models.whatsapp_chat.count({
                  where: {
                    agency_fk: agency_id,
                    msg_body: cta_text,
                    campaign_name: message_tracker?.campaign_name,
                    created_date: { [Op.gt]: broadcast_date },
                  },
                  include: {
                    model: models.whatsapp_message_tracker,
                    required: true,
                    where: {
                      tracker_ref_name: tracker_ref_name,
                      tracker_type: 'main',
                    },
                  },
                  group: ['whatsapp_chat.agency_fk'],
                  attributes: [
                    [
                      Sequelize.fn(
                        'COUNT',
                        Sequelize.fn(
                          'DISTINCT',
                          Sequelize.col('whatsapp_chat.contact_fk'),
                        ),
                      ),
                      'total_count',
                    ],
                  ],
                });

                agency_performance.cta[cta_index] = {
                  name: cta[`cta_${cta_index + 1}`]
                    ? cta[`cta_${cta_index + 1}`]
                    : 'CTA Not Available',
                  value:
                    cta_count && cta_count[0]?.total_count
                      ? cta_count[0]?.total_count
                      : 0,
                };
              }
            }
          }

          for (const index in quick_replies) {
            if (h.cmpStr(quick_replies[index].value, 'manual_reply')) {
              const manual_reply_count = await models.whatsapp_chat.count({
                where: {
                  agency_fk: agency_id,
                  msg_type: 'text',
                  campaign_name: message_tracker?.campaign_name,
                  created_date: { [Op.gt]: broadcast_date },
                },
                include: {
                  model: models.whatsapp_message_tracker,
                  required: true,
                  where: {
                    tracker_ref_name: tracker_ref_name,
                    tracker_type: 'main',
                  },
                },
                attributes: [
                  [
                    Sequelize.fn(
                      'COUNT',
                      Sequelize.fn(
                        'DISTINCT',
                        Sequelize.col('whatsapp_chat.contact_fk'),
                      ),
                    ),
                    'total_count',
                  ],
                ],
                group: ['whatsapp_chat.agency_fk'],
              });

              agency_performance.manual_replies =
                manual_reply_count && manual_reply_count[0]?.total_count
                  ? manual_reply_count[0]?.total_count
                  : 0;
            }
          }

          const sent_count = await models.whatsapp_message_tracker.count({
            where: {
              agency_fk: agency_id,
              tracker_ref_name: tracker_ref_name,
              tracker_type: 'main',
              broadcast_date: broadcast_date,
            },
          });
          agency_performance.sent = sent_count;

          const pending_count = await models.whatsapp_message_tracker.count({
            where: {
              agency_fk: agency_id,
              pending: 1,
              failed: 0,
              sent: 0,
              delivered: 0,
              read: 0,
              replied: 0,
              tracker_ref_name: tracker_ref_name,
              tracker_type: 'main',
              broadcast_date: broadcast_date,
            },
          });
          agency_performance.pending = pending_count;

          const delivered_count = await models.whatsapp_message_tracker.count({
            where: {
              agency_fk: agency_id,
              sent: 1,
              failed: 0,
              pending: 0,
              tracker_ref_name: tracker_ref_name,
              tracker_type: 'main',
              broadcast_date: broadcast_date,
            },
          });
          agency_performance.delivered = delivered_count;
          agency_performance.failed = sent_count - delivered_count;
          agency_performance.og_failed = sent_count - delivered_count;

          const read_count = await models.whatsapp_message_tracker.count({
            where: {
              agency_fk: agency_id,
              sent: 1,
              read: 1,
              tracker_ref_name: tracker_ref_name,
              tracker_type: 'main',
              broadcast_date: broadcast_date,
            },
          });
          agency_performance.read = read_count;
        }

        h.api.createResponse(
          req,
          res,
          200,
          { agency_performance },
          '1-agency-campaign-performance-1622176515',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-agency-campaign-performance-1622176528',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/agency/:agency_id/waba-credentials Get agency waba credentials
   * @apiName StaffAgencyWABACredentials
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object[]} agency_performance list of agency campaign performance data
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *    "agency_performance": {
   *        "cta": {
   *            "0": 1,
   *            "1": 0,
   *            "2": 1
   *        },
   *        "manual_replies": 3,
   *        "proposal_opened": 0,
   *        "delivered": 1
   *    },
   *    "status": "ok",
   *    "message": "Retrieved campaign performance successfully",
   *    "message_code": "1-agency-campaign-performance-1622176515"
   *}
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency/:agency_id/waba-credentials',
    schema: {
      params: {
        agency_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      try {
        const { agency_id } = req.params;
        const agency_whatsapp_config =
          await c.agencyWhatsAppConfig.getWABACredentialList({
            agency_fk: agency_id,
            is_active: 1,
          });
        const non_trial_agency_whatsapp_config =
          await c.agencyWhatsAppConfig.getWABACredentialList({
            agency_fk: agency_id,
            is_active: 1,
            trial_number_to_use: false,
          });
        const last_updated_item = await models.agency_whatsapp_config.findOne({
          where: { agency_fk: agency_id, is_active: 1 },
          attributes: ['updated_date'],
          order: [['updated_date', 'DESC']],
        });
        h.api.createResponse(
          req,
          res,
          200,
          {
            agency_whatsapp_config,
            non_trial_agency_whatsapp_config,
            last_updated_date: h.notEmpty(last_updated_item)
              ? last_updated_item?.updated_date
              : null,
          },
          '1-agency-waba-credentials-1622176515',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-agency-waba-credentials-1622176528',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/agency/:agency_whatsapp_config_id/selected-waba-credentials Get selected agency waba credentials
   * @apiName StaffSelectedAgencyWABACredentials
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object[]} agency_performance list of agency campaign performance data
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency/:agency_whatsapp_config_id/selected-waba-credentials',
    schema: {
      params: {
        agency_whatsapp_config_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      try {
        const { agency_whatsapp_config_id } = req.params;
        const agency_whatsapp_config =
          await c.agencyWhatsAppConfig.getSelectedWABACredential({
            agency_whatsapp_config_id: agency_whatsapp_config_id,
          });

        h.api.createResponse(
          req,
          res,
          200,
          {
            agency_whatsapp_config,
          },
          '1-agency-waba-template-credentials-1622176515',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-agency-waba-template-credentials-1622176528',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/agency/additional-cta/:agency_id Get agency additional cta list
   * @apiName StaffAgencyAdditionalCTA
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object[]} additional_cta list of agency additional cta
   */

  fastify.route({
    method: 'GET',
    url: '/staff/agency/additional-cta/:agency_id',
    schema: {
      params: {
        agency_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      try {
        const { agency_id } = req.params;
        const additional_cta = await c.campaignAdditionalCta.findAll({
          agency_fk: agency_id,
        });

        h.api.createResponse(
          req,
          res,
          200,
          {
            additional_cta,
          },
          '1-agency-additional-cta-1622176515',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-agency-additional-cta-1622176528',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/agency/subscription-data Get agency subscription data
   * @apiName StaffSubscriptioData
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object[]} additional_cta list of agency additional cta
   */

  fastify.route({
    method: 'GET',
    url: '/staff/agency/subscription-data',
    schema: {
      params: {
        agency_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const stripe = require('stripe')(config.stripe.secretKey);
      try {
        const { agency_id } = req.query;
        const period = {
          end: '',
          start: '',
        };

        const subscriptionData = await c.agencySubscription.findOne(
          {
            agency_fk: agency_id,
            status: 'active',
          },
          { order: [['created_date', 'DESC']] },
        );

        if (subscriptionData) {
          // get subscription main product
          const usage_product_name = subscriptionData?.subscription_name;
          const subscriptionProduct = await c.agencySubscriptionProduct.findOne(
            {
              agency_subscription_fk: subscriptionData?.agency_subscription_id,
              product_name: subscriptionData?.subscription_name,
            },
          );
          const current_plan_product = await stripe.products.retrieve(
            subscriptionProduct.stripe_product_id,
          );

          const current_subscription_matrix =
            await c.agencySubscriptionProduct.getSubscriptionCredits(
              subscriptionData,
            );

          const channelWhere = {
            agency_fk: agency_id,
            trial_number_to_use: false,
          };

          const [
            total_channels,
            total_users,
            { campaign_count: total_campaigns },
            total_contacts,
            total_automations,
            { message_count: total_messages },
          ] = await Promise.all([
            c.agencyWhatsAppConfig.count(channelWhere),
            c.agencyUser.count(
              { agency_fk: agency_id },
              {
                include: [
                  {
                    model: models.user,
                    required: true,
                    include: [
                      {
                        model: models.user_role,
                        where: {
                          user_role: {
                            [Op.notIn]: [
                              constant.USER.ROLE.AGENCY_ADMIN,
                              constant.USER.ROLE.AGENCY_MARKETING,
                              constant.USER.ROLE.AGENCY_SALES,
                            ],
                          },
                        },
                        required: true,
                      },
                    ],
                  },
                ],
              },
            ),
            c.campaignInventory.findOne({
              agency_fk: agency_id,
              agency_subscription_fk: subscriptionData?.agency_subscription_id,
            }),
            c.contact.count({
              agency_fk: agency_id,
              status: 'active',
            }),
            c.automationRule.count(
              {
                status: 'active',
              },
              {
                include: [
                  {
                    model: models.automation_category,
                    required: true,
                    where: {
                      agency_fk: agency_id,
                    },
                  },
                ],
              },
            ),
            c.messageInventory.findOne({
              agency_fk: agency_id,
              agency_subscription_fk: subscriptionData?.agency_subscription_id,
            }),
          ]);

          const subscription = await stripe.subscriptions.retrieve(
            subscriptionData.stripe_subscription_id,
          );

          period.start = moment(
            subscriptionData.subscription_start,
            'X',
          ).format('DD MMM YYYY');

          period.end = moment(subscriptionData.subscription_end, 'X').format(
            'DD MMM YYYY',
          );

          h.api.createResponse(
            req,
            res,
            200,
            {
              productName: usage_product_name,
              subscriptionStatus: subscriptionData.status,
              subscription,
              plan: current_plan_product,
              matrix: current_subscription_matrix,
              period,
              inventory: {
                total_channels,
                total_users,
                total_campaigns,
                total_contacts,
                total_automations,
                total_messages,
              },
            },
            '3-stripe-1622176015',
            {
              portal,
            },
          );
        } else {
          h.api.createResponse(req, res, 200, {}, '2-stripe-error-1622176015', {
            portal,
          });
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(req, res, 500, {}, '2-stripe-error-1622176015', {
          portal,
        });
      }
    },
  });

  /**
   * @api {get} /v1/staff/agency/subscription-cancel Cancel agency subscription

   */

  fastify.route({
    method: 'POST',
    url: '/staff/agency/subscription-cancel',
    schema: {
      body: {
        type: 'object',
        required: ['agency_id', 'subscription_id'],
        properties: {
          agency_id: { type: 'string' },
          subscription_id: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const stripe = require('stripe')(config.config.secretKey);
      try {
        const { agency_id, subscription_id } = req.body;

        const subscription = await stripe.subscriptions.cancel(subscription_id);

        h.api.createResponse(
          req,
          res,
          200,
          {},
          'stripe-1622176015-cancel-success',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          req,
          res,
          500,
          {},
          'stripe-1622176015-cancel-failed',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/agency/:agency_id/:waba_number/waba-status Get agency registered waba status data
   * @apiName StaffAgencyWABAStatus
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object[]} waba agency waba status
   */

  fastify.route({
    method: 'GET',
    url: '/staff/agency/:agency_id/:waba_number/waba-status',
    schema: {
      params: {
        agency_id: { type: 'string' },
        waba_number: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      try {
        const { agency_id, waba_number } = req.params;
        const whatsAppConfig = await c.agencyWhatsAppConfig.findOne(
          {
            agency_fk: agency_id,
            waba_number: waba_number,
          },
          {
            order: [['waba_name', 'ASC']],
          },
        );

        if (whatsAppConfig) {
          const wabaStatus = await h.whatsapp.getWABAStatus({
            agency_waba_id: whatsAppConfig?.agency_waba_id,
            agency_waba_template_token:
              whatsAppConfig?.agency_waba_template_token,
            agency_waba_template_secret:
              whatsAppConfig?.agency_waba_template_secret,
            log: req.log,
          });
          h.api.createResponse(
            req,
            res,
            200,
            wabaStatus,
            '1-agency-waba-1622176015',
            {
              portal,
            },
          );
        } else {
          h.api.createResponse(req, res, 200, {}, '2-agency-waba-1622176015', {
            portal,
          });
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(req, res, 500, {}, '3-agency-waba-1622176015', {
          portal,
        });
      }
    },
  });

  /**
   * @api {get} /v1/staff/agency/:waba_number/db-waba-status Get agency registered waba status data from database
   * @apiName StaffAgencyWABADBStatus
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object[]} waba agency waba status
   */

  fastify.route({
    method: 'GET',
    url: '/staff/agency/:waba_number/db-waba-status',
    schema: {
      params: {
        waba_number: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      try {
        const { waba_number } = req.params;
        const whatsAppConfig = await c.agencyWhatsAppConfig.findOne(
          {
            waba_number: waba_number,
          },
          {
            order: [['waba_name', 'ASC']],
          },
        );

        if (whatsAppConfig) {
          const wabaStatus = {
            waba_number: whatsAppConfig?.waba_number,
            waba_status: whatsAppConfig?.waba_status,
            waba_quality: whatsAppConfig?.waba_quality,
          };
          h.api.createResponse(
            req,
            res,
            200,
            wabaStatus,
            '1-agency-waba-1622176015',
            {
              portal,
            },
          );
        } else {
          h.api.createResponse(req, res, 200, {}, '2-agency-waba-1622176015', {
            portal,
          });
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(req, res, 500, {}, '3-agency-waba-1622176015', {
          portal,
        });
      }
    },
  });

  /**
   * @api {get} /v1/staff/agency/:agency_id/:channel_type/channel-list Get agency channel type list
   * @apiName StaffAgencyChannelList
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object[]} waba agency waba status
   */

  fastify.route({
    method: 'GET',
    url: '/staff/agency/:agency_id/:channel_type/channel-list',
    schema: {
      params: {
        agency_id: { type: 'string' },
        channel_type: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      try {
        const { agency_id, channel_type } = req.params;
        console.log(channel_type);
        const channel_where = {
          agency_fk: agency_id,
        };

        if (h.cmpStr(channel_type, 'line')) {
          channel_where.channel_type = {
            [Op.in]: ['line', 'line-direct'],
          };
        }
        if (h.cmpStr(channel_type, 'messenger')) {
          channel_where.channel_type = {
            [Op.in]: ['fbmessenger'],
          };
        }
        console.log(channel_where);
        const channels = await c.agencyChannelConfig.getAllChannelConfigDetails(
          channel_where,
          {
            order: [['channel_name', 'ASC']],
          },
        );

        if (!h.isEmpty(channels)) {
          h.api.createResponse(
            req,
            res,
            200,
            channels,
            '1-agency-channel-list-1622176015',
            {
              portal,
            },
          );
        } else {
          h.api.createResponse(
            req,
            res,
            200,
            {},
            '2-agency-channel-list-1622176015',
            {
              portal,
            },
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '3-agency-channel-list-1622176015',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/staff/agency/line-channel/channel-id/:line_channel_id',
    schema: {
      params: {
        line_channel_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { line_channel_id } = req.params;

      try {
        const line_channel = await c.agencyChannelConfig.findOne({
          channel_id: line_channel_id,
          channel_type: 'line',
        });

        h.api.createResponse(
          req,
          res,
          200,
          { line_channel },
          '1-agency-channel-1622176015',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/staff/agency/line-channel/channel-id/:line_channel_id',
        });
        h.api.createResponse(req, res, 500, {}, '2-agency-channel-1622176015', {
          portal,
        });
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/staff/agency/line-channel/config-id/:agency_channel_config_id',
    schema: {
      params: {
        agency_channel_config_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { agency_channel_config_id } = req.params;

      try {
        const line_channel = await c.agencyChannelConfig.findOne({
          agency_channel_config_id: agency_channel_config_id,
          channel_type: 'line',
        });

        h.api.createResponse(
          req,
          res,
          200,
          { line_channel },
          '1-agency-channel-1622176015',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/staff/agency/line-channel/config-id/:line_channel_id',
        });
        h.api.createResponse(req, res, 500, {}, '2-agency-channel-1622176015', {
          portal,
        });
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/staff/agency/:agency_id/line/contact-channel-list/:contact_id',
    schema: {
      params: {
        agency_id: { type: 'string' },
        contact_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      try {
        const { agency_id, contact_id } = req.params;

        const followedChannels = await c.lineFollower.findAll({
          contact_fk: contact_id,
        });

        const channelIDs = [];

        followedChannels.forEach((channel) => {
          channelIDs.push(channel.dataValues.agency_channel_config_fk);
        });

        const channel_where = {
          agency_fk: agency_id,
          channel_type: 'line',
          agency_channel_config_id: {
            [Op.in]: channelIDs,
          },
        };

        const channels = await c.agencyChannelConfig.findAll(channel_where, {
          order: [['channel_name', 'ASC']],
        });

        if (!h.isEmpty(channels)) {
          h.api.createResponse(
            req,
            res,
            200,
            channels,
            '1-agency-channel-list-1622176015',
            {
              portal,
            },
          );
        } else {
          h.api.createResponse(
            req,
            res,
            200,
            {},
            '2-agency-channel-list-1622176015',
            {
              portal,
            },
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '3-agency-channel-list-1622176015',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/agency/:agency_id/campaign-performance/:tracker_ref_name Get agency Line campaign performance
   * @apiName StaffAgencyLineCampaignPerformance
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object[]} agency_performance list of agency campaign performance data
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *    "agency_performance": {
   *        "cta": {
   *            "0": 1,
   *            "1": 0,
   *            "2": 1
   *        },
   *        "manual_replies": 3,
   *        "proposal_opened": 0,
   *        "delivered": 1
   *    },
   *    "status": "ok",
   *    "message": "Retrieved campaign performance successfully",
   *    "message_code": "1-agency-campaign-performance-1622176515"
   *}
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency/:agency_id/line-campaign-performance/:tracker_ref_name',
    schema: {
      params: {
        agency_id: { type: 'string' },
        tracker_ref_name: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      try {
        const { agency_id, tracker_ref_name } = req.params;
        const agency = await c.agency.findOne({ agency_id });
        const { whatsapp_config } = await models.agency_config.findOne({
          where: { agency_fk: agency_id },
        });

        const cta = await models.campaign_cta.findOne({
          where: { campaign_tracker_ref_name: tracker_ref_name },
        });

        const agency_performance = {
          cta: {},
          batch_count: 0,
          manual_replies: 0,
          proposal_opened: 0,
          pending: 0,
          og_failed: 0,
          failed: 0,
          sent: 0,
          delivered: 0,
          read: 0,
          replied: 0,
        };
        if (!h.isEmpty(whatsapp_config)) {
          const config = JSON.parse(whatsapp_config);
          const quick_replies = config.quick_replies;
          const cta_index = 0;
          const message_tracker = await models.line_message_tracker.findOne({
            where: {
              tracker_ref_name: tracker_ref_name,
            },
          });
          const broadcast_date = new Date(message_tracker.broadcast_date);
          agency_performance.batch_count = message_tracker.batch_count;

          // if (!h.isEmpty(cta)) {
          //   const cta_1_count = await models.whatsapp_chat.count({
          //     where: {
          //       agency_fk: agency_id,
          //       [Op.or]: [
          //         {
          //           msg_body: { [Op.eq]: cta.cta_1 },
          //           campaign_name: { [Op.eq]: message_tracker?.campaign_name },
          //         },
          //         { original_event_id: { [Op.eq]: 'web_app_event' } },
          //       ],
          //       created_date: { [Op.gt]: broadcast_date },
          //     },
          //     include: {
          //       model: models.whatsapp_message_tracker,
          //       required: true,
          //       where: {
          //         tracker_ref_name: tracker_ref_name,
          //         tracker_type: 'main',
          //       },
          //     },
          //     group: ['whatsapp_chat.agency_fk'],
          //     attributes: [
          //       [
          //         Sequelize.fn(
          //           'COUNT',
          //           Sequelize.fn(
          //             'DISTINCT',
          //             Sequelize.col('whatsapp_chat.contact_fk'),
          //           ),
          //         ),
          //         'total_count',
          //       ],
          //     ],
          //   });

          //   agency_performance.cta[0] = {
          //     name: cta.cta_1,
          //     value:
          //       cta_1_count && cta_1_count[0]?.total_count
          //         ? cta_1_count[0]?.total_count
          //         : 0,
          //   };

          //   const cta_2_count = await models.whatsapp_chat.count({
          //     where: {
          //       agency_fk: agency_id,
          //       msg_body: cta.cta_2,
          //       campaign_name: message_tracker?.campaign_name,
          //       created_date: { [Op.gt]: broadcast_date },
          //     },
          //     include: {
          //       model: models.whatsapp_message_tracker,
          //       required: true,
          //       where: {
          //         tracker_ref_name: tracker_ref_name,
          //         tracker_type: 'main',
          //       },
          //     },
          //     group: ['whatsapp_chat.agency_fk'],
          //     attributes: [
          //       [
          //         Sequelize.fn(
          //           'COUNT',
          //           Sequelize.fn(
          //             'DISTINCT',
          //             Sequelize.col('whatsapp_chat.contact_fk'),
          //           ),
          //         ),
          //         'total_count',
          //       ],
          //     ],
          //   });

          //   agency_performance.cta[1] = {
          //     name: cta.cta_2,
          //     value:
          //       cta_2_count && cta_2_count[0]?.total_count
          //         ? cta_2_count[0]?.total_count
          //         : 0,
          //   };

          //   const cta_3_count = await models.whatsapp_chat.count({
          //     where: {
          //       agency_fk: agency_id,
          //       msg_body: cta.cta_3,
          //       campaign_name: message_tracker?.campaign_name,
          //       created_date: { [Op.gt]: broadcast_date },
          //     },
          //     include: {
          //       model: models.whatsapp_message_tracker,
          //       required: true,
          //       where: {
          //         tracker_ref_name: tracker_ref_name,
          //         tracker_type: 'main',
          //       },
          //     },
          //     group: ['whatsapp_chat.agency_fk'],
          //     attributes: [
          //       [
          //         Sequelize.fn(
          //           'COUNT',
          //           Sequelize.fn(
          //             'DISTINCT',
          //             Sequelize.col('whatsapp_chat.contact_fk'),
          //           ),
          //         ),
          //         'total_count',
          //       ],
          //     ],
          //   });

          //   agency_performance.cta[2] = {
          //     name: cta.cta_3 ? cta.cta_3 : 'CTA Not Available',
          //     value:
          //       cta_3_count && cta_3_count[0]?.total_count
          //         ? cta_3_count[0]?.total_count
          //         : 0,
          //   };

          //   const cta_4_count = await models.whatsapp_chat.count({
          //     where: {
          //       agency_fk: agency_id,
          //       msg_body: cta.cta_4,
          //       campaign_name: message_tracker?.campaign_name,
          //       created_date: { [Op.gt]: broadcast_date },
          //     },
          //     include: {
          //       model: models.whatsapp_message_tracker,
          //       required: true,
          //       where: {
          //         tracker_ref_name: tracker_ref_name,
          //         tracker_type: 'main',
          //       },
          //     },
          //     group: ['whatsapp_chat.agency_fk'],
          //     attributes: [
          //       [
          //         Sequelize.fn(
          //           'COUNT',
          //           Sequelize.fn(
          //             'DISTINCT',
          //             Sequelize.col('whatsapp_chat.contact_fk'),
          //           ),
          //         ),
          //         'total_count',
          //       ],
          //     ],
          //   });

          //   agency_performance.cta[3] = {
          //     name: cta.cta_4 ? cta.cta_4 : 'CTA Not Available',
          //     value:
          //       cta_4_count && cta_4_count[0]?.total_count
          //         ? cta_4_count[0]?.total_count
          //         : 0,
          //   };

          //   const cta_5_count = await models.whatsapp_chat.count({
          //     where: {
          //       agency_fk: agency_id,
          //       msg_body: cta.cta_5,
          //       campaign_name: message_tracker?.campaign_name,
          //       created_date: { [Op.gt]: broadcast_date },
          //     },
          //     include: {
          //       model: models.whatsapp_message_tracker,
          //       required: true,
          //       where: {
          //         tracker_ref_name: tracker_ref_name,
          //         tracker_type: 'main',
          //       },
          //     },
          //     group: ['whatsapp_chat.agency_fk'],
          //     attributes: [
          //       [
          //         Sequelize.fn(
          //           'COUNT',
          //           Sequelize.fn(
          //             'DISTINCT',
          //             Sequelize.col('whatsapp_chat.contact_fk'),
          //           ),
          //         ),
          //         'total_count',
          //       ],
          //     ],
          //   });

          //   agency_performance.cta[4] = {
          //     name: cta.cta_5 ? cta.cta_5 : 'CTA Not Available',
          //     value:
          //       cta_5_count && cta_5_count[0]?.total_count
          //         ? cta_5_count[0]?.total_count
          //         : 0,
          //   };
          // }

          // for (const index in quick_replies) {
          //   if (
          //     h.isEmpty(cta) &&
          //     h.cmpStr(quick_replies[index].type, 'template')
          //   ) {
          //     const cta_count = await models.whatsapp_chat.count({
          //       where: {
          //         agency_fk: agency_id,
          //         msg_body: quick_replies[index].name,
          //         created_date: { [Op.gt]: broadcast_date },
          //       },
          //       include: {
          //         model: models.whatsapp_message_tracker,
          //         required: true,
          //         where: {
          //           tracker_ref_name: tracker_ref_name,
          //           tracker_type: 'main',
          //         },
          //       },
          //     });
          //     agency_performance.cta[cta_index] = {
          //       name: quick_replies[index].name,
          //       value: cta_count,
          //     };
          //     cta_index += 1;
          //   }
          //   if (h.cmpStr(quick_replies[index].value, 'manual_reply')) {
          //     const manual_reply_count = await models.whatsapp_chat.count({
          //       where: {
          //         agency_fk: agency_id,
          //         msg_type: 'text',
          //         campaign_name: message_tracker?.campaign_name,
          //         created_date: { [Op.gt]: broadcast_date },
          //       },
          //       include: {
          //         model: models.whatsapp_message_tracker,
          //         required: true,
          //         where: {
          //           tracker_ref_name: tracker_ref_name,
          //           tracker_type: 'main',
          //         },
          //       },
          //       attributes: [
          //         [
          //           Sequelize.fn(
          //             'COUNT',
          //             Sequelize.fn(
          //               'DISTINCT',
          //               Sequelize.col('whatsapp_chat.contact_fk'),
          //             ),
          //           ),
          //           'total_count',
          //         ],
          //       ],
          //       group: ['whatsapp_chat.agency_fk'],
          //     });

          //     agency_performance.manual_replies =
          //       manual_reply_count && manual_reply_count[0]?.total_count
          //         ? manual_reply_count[0]?.total_count
          //         : 0;
          //   }
          // }

          const readers = await models.line_message_tracker.findAll({
            where: {
              agency_fk: agency_id,
              sent: 1,
              read: 1,
              tracker_ref_name: tracker_ref_name,
              tracker_type: 'main',
              broadcast_date: broadcast_date,
            },
          });

          const readers_id = [];

          for (const reader of readers) {
            readers_id.push(reader?.contact_fk);
          }

          const opened_proposal_count = await models.contact.count({
            where: {
              agency_fk: agency_id,
              contact_id: {
                [Op.in]: readers_id,
              },
              lead_status: {
                [Op.in]: ['proposal_opened', 'updated_proposal_opened'],
              },
              permalink_sent_date: { [Op.gt]: broadcast_date },
            },
          });
          agency_performance.proposal_opened = opened_proposal_count;

          const sent_count = await models.line_message_tracker.count({
            where: {
              agency_fk: agency_id,
              sent: 1,
              tracker_ref_name: tracker_ref_name,
              tracker_type: 'main',
              broadcast_date: broadcast_date,
            },
          });
          agency_performance.sent = sent_count;

          const pending_count = await models.line_message_tracker.count({
            where: {
              agency_fk: agency_id,
              pending: 1,
              failed: 0,
              sent: 0,
              delivered: 0,
              read: 0,
              replied: 0,
              tracker_ref_name: tracker_ref_name,
              tracker_type: 'main',
              broadcast_date: broadcast_date,
            },
          });
          agency_performance.pending = pending_count;

          const failed_count = await models.line_message_tracker.count({
            where: {
              agency_fk: agency_id,
              failed: 1,
              pending: 0,
              sent: 0,
              delivered: 0,
              read: 0,
              replied: 0,
              tracker_ref_name: tracker_ref_name,
              tracker_type: 'main',
              broadcast_date: broadcast_date,
            },
          });
          // agency_performance.failed = failed_count;
          // agency_performance.og_failed = failed_count;

          const delivered_count = await models.line_message_tracker.count({
            where: {
              agency_fk: agency_id,
              sent: 1,
              delivered: 1,
              failed: 0,
              pending: 0,
              tracker_ref_name: tracker_ref_name,
              tracker_type: 'main',
              broadcast_date: broadcast_date,
            },
          });
          agency_performance.delivered = delivered_count;
          agency_performance.failed =
            message_tracker.batch_count - delivered_count;
          agency_performance.og_failed =
            message_tracker.batch_count - delivered_count;

          const read_count = await models.line_message_tracker.count({
            where: {
              agency_fk: agency_id,
              sent: 1,
              read: 1,
              tracker_ref_name: tracker_ref_name,
              tracker_type: 'main',
              broadcast_date: broadcast_date,
            },
          });
          agency_performance.read = read_count;
          const replied_count = await models.line_message_tracker.count({
            where: {
              agency_fk: agency_id,
              sent: 1,
              read: 1,
              tracker_ref_name: tracker_ref_name,
              tracker_type: 'main',
              broadcast_date: broadcast_date,
            },
          });
          agency_performance.replied = replied_count;
        }

        h.api.createResponse(
          req,
          res,
          200,
          { agency_performance },
          '1-agency-campaign-performance-1622176515',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-agency-campaign-performance-1622176528',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/agency/line-channel',
    schema: {
      body: {
        type: 'object',
        required: [
          'agency_id',
          'bot_basic_id',
          'channel_access_token',
          'channel_id',
          'channel_name',
          'channel_secret',
        ],
        properties: {
          agency_id: { type: 'string' },
          bot_basic_id: { type: 'string' },
          channel_access_token: { type: 'string' },
          channel_id: { type: 'string' },
          channel_name: { type: 'string' },
          channel_secret: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAgencyAdminPermission(req, res);
    },
    handler: async (req, res) => {
      try {
        const {
          agency_id,
          bot_basic_id,
          channel_access_token,
          channel_id,
          channel_name,
          channel_secret,
        } = req.body;
        const { user_id } = h.user.getCurrentUser(req);
        const { agency_channel_config_id } = await h.database.transaction(
          async (transaction) => {
            const agency_channel_config_id = await c.agencyChannelConfig.create(
              {
                agency_fk: agency_id,
                channel_id: channel_id,
                channel_name: channel_name,
                bot_id: bot_basic_id,
                channel_type: 'line',
                uib_api_token: channel_access_token,
                uib_api_secret: channel_secret,
                created_by: user_id,
              },
              { transaction: transaction },
            );
            return { agency_channel_config_id };
          },
        );

        h.api.createResponse(
          req,
          res,
          200,
          { agency_channel_config_id },
          '1-agency-channel-created-1622176015',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${req.url}: user failed to create new line channel`, {
          err,
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-agency-channel-created-1622176015',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/staff/agency/:agencyId/unsubscribe-texts',
    schema: {},
    preValidation: async (req, res) => {
      await Promise.all([
        userMiddleware.isLoggedIn(req, res),
        userMiddleware.hasAccessToStaffPortal(req, res),
      ]);
    },
    handler: async (req, res) => {
      const { agencyId } = req.params;

      try {
        const unubscribeTexts = await models.unsubscribe_text.findAll({
          where: { agency_fk: agencyId },
          order: [['content', 'ASC']],
        });

        h.api.createResponse(
          req,
          res,
          200,
          unubscribeTexts,
          'unsubscribe-texts-1692757100-retrieve-success',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/agency/:agencyId/unsubscribe-texts',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          'unsubscribe-texts-1692757100-retrieve-failed',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/agency/unsubscribe-text',
    schema: {
      body: {
        type: 'object',
        required: ['agency_id', 'content'],
        properties: {
          agency_id: { type: 'string' },
          content: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAgencyAdminPermission(req, res);
    },
    handler: async (req, res) => {
      try {
        const { agency_id, content } = req.body;
        const { user_id } = h.user.getCurrentUser(req);
        const { unsubscribe_text_id } = await h.database.transaction(
          async (transaction) => {
            const unsubscribe_text_id = h.general.generateId();
            await models.unsubscribe_text.create(
              {
                unsubscribe_text_id: unsubscribe_text_id,
                agency_fk: agency_id,
                content: content,
                created_by: user_id,
              },
              { transaction: transaction },
            );
            return { unsubscribe_text_id };
          },
        );

        h.api.createResponse(
          req,
          res,
          200,
          { unsubscribe_text_id },
          '1-unsubscribe-text-1622176015',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${req.url}: user failed to create new unsubscribe text`, {
          err,
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-unsubscribe-text-1622176015',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'DELETE',
    url: '/staff/agency/unsubscribe-text/:unsubscribe_text_id',
    schema: {
      params: {
        unsubscribe_text_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { unsubscribe_text_id } = req.params;

      try {
        const record = await models.unsubscribe_text.findOne({
          where: { unsubscribe_text_id: unsubscribe_text_id },
        });

        if (record) {
          await record.destroy();

          h.api.createResponse(
            req,
            res,
            200,
            { unsubscribe_text: record },
            '1-delete-unsubscribe-trigger-text-1663834299369',
            {
              portal,
            },
          );
        } else {
          throw new Error(`Trigger text not found.`);
        }
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/agency/unsubscribe-text/:unsubscribe_text_id',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-delete-unsubscribe-trigger-text-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/agency/whatsapp-onboarding Submit onboarding details for whatsapp
   * @apiName StaffAgencyWhatsAppOnboarding
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency
   * @apiUse ServerError
   *
   * @apiParam {string} agency_id
   * @apiParam {string} facebook_manager_id
   * @apiParam {string} client_company_name
   * @apiParam {string} display_image
   * @apiParam {string} address
   * @apiParam {string} email
   * @apiParam {string} website
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} whatsapp_onboarding_id Onboarding ID.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "agency_id": "1234",
   * }
   */

  fastify.route({
    method: 'POST',
    url: '/staff/agency/whatsapp-onboarding',
    schema: {
      body: {
        type: 'object',
        required: [
          'agency_id',
          'facebook_manager_id',
          'client_company_name',
          'display_image',
          'about',
          'address',
          'email',
          'website',
        ],
        properties: {
          agency_id: { type: 'string' },
          facebook_manager_id: { type: 'string' },
          client_company_name: { type: 'string' },
          display_image: { type: 'string' },
          about: { type: 'string' },
          address: { type: 'string' },
          email: { type: 'string' },
          website: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAgencyAdminPermission(req, res);
      await agencyMiddleware.canOnboardWABAChannel(req, res);
    },
    handler: async (req, res) => {
      try {
        const { user_id } = h.user.getCurrentUser(req);
        const user = await c.user.findOne({ user_id: user_id });
        const agencyUser = await c.agencyUser.findOne({ user_fk: user_id });
        const created_by = agencyUser.agency_user_id;
        const {
          agency_id,
          facebook_manager_id,
          client_company_name,
          display_image,
          about,
          address,
          email,
          website,
          whatsapp_onboarding_id: whatsappOnboardingId,
        } = req.body;

        if (whatsappOnboardingId) {
          await c.whatsappOnboarding.update(
            whatsappOnboardingId,
            {
              facebook_manager_id,
              client_company_name,
              display_image,
              about,
              address,
              email,
              website,
            },
            created_by,
          );

          return h.api.createResponse(
            req,
            res,
            200,
            {
              whatsapp_onboarding_id: whatsappOnboardingId,
              agency_fk: agency_id,
              facebook_manager_id,
              client_company_name,
              display_image,
              about,
              address,
              email,
              website,
            },
            '1-whatsapp-onboarding-1622176015',
            {
              portal,
            },
          );
        }

        const whatsapp_onboarding_id = await c.whatsappOnboarding.create({
          agency_fk: agency_id,
          facebook_manager_id,
          client_company_name,
          display_image,
          about,
          address,
          email,
          website,
          created_by,
        });

        const agency = await c.agency.findOne({
          agency_id: agency_id,
        });

        await h.email.sendEmail(
          `Chaaat Team <support@${config?.email?.domain || 'chaaat.io'}>`,
          user.email,
          null,
          h.getMessageByCode(
            'template-onboarding-pending-subject-1601338955192',
          ),
          h.getMessageByCode('template-onboarding-pending-body-1601338955192', {
            FIRST_NAME: user.first_name,
            LAST_NAME: user.last_name,
            AGENCY_NAME: agency.agency_name,
            FACEBOOK_ID: facebook_manager_id,
            ONBOARDING: client_company_name,
            ADDRESS: address,
            EMAIL: email,
            WEBSITE: website,
            URL: config.webAdminUrl,
          }),
        );

        const data = JSON.stringify({
          text: `<!here> ${agency.agency_name} posted a new WhatsApp Onboarding Request for ${client_company_name} pending for submission. Thank you.`,
        });

        const notif_config = {
          method: 'post',
          url: 'https://hooks.slack.com/services/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',
          headers: {
            'Content-Type': 'application/json',
          },
          data: data,
        };

        await axios(notif_config)
          // eslint-disable-next-line promise/always-return
          .then(function (response) {
            console.log(JSON.stringify(response.data));
          })
          .catch(function (error) {
            console.log(error);
          });

        h.api.createResponse(
          req,
          res,
          200,
          {
            whatsapp_onboarding_id,
            agency_fk: agency_id,
            facebook_manager_id,
            client_company_name,
            display_image,
            about,
            address,
            email,
            website,
          },
          '1-whatsapp-onboarding-1622176015',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${req.url}: user failed to create new whatsapp onboarding record`,
          {
            err,
          },
        );
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-onboarding-1622176015',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {put} /v1/staff/agency/whatsapp-onboarding:whatsapp_onboarding_id Update onboarding details for whatsapp
   * @apiName StaffAgencyWhatsAppOnboardingUpdate
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency
   * @apiUse ServerError
   *
   * @apiParam {string} facebook_manager_id
   * @apiParam {string} client_company_name
   * @apiParam {string} display_image
   * @apiParam {string} whatsapp_status
   * @apiParam {string} address
   * @apiParam {string} email
   * @apiParam {string} website
   * @apiParams {string} status
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} whatsapp_onboarding_id Onboarding ID.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "agency_id": "1234",
   * }
   */

  fastify.route({
    method: 'PUT',
    url: '/staff/agency/whatsapp-onboarding/:whatsapp_onboarding_id',
    schema: {
      params: {
        whatsapp_onboarding_id: { type: 'string' },
      },
      body: {
        type: 'object',
        properties: {
          facebook_manager_id: { type: 'string' },
          client_company_name: { type: 'string' },
          display_image: { type: 'string' },
          about: { type: 'string' },
          address: { type: 'string' },
          email: { type: 'string' },
          website: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAgencyAdminPermission(req, res);
      await agencyMiddleware.canOnboardWABAChannel(req, res);
    },
    handler: async (req, res) => {
      try {
        const { user_id } = h.user.getCurrentUser(req);

        // const isSuperAdmin = await c.userRole.findOne({
        //   user_fk: user_id,
        //   user_role: constant.USER.ROLE.SUPER_ADMIN,
        // });

        // if (isSuperAdmin) {
        const agencyUser = await c.agencyUser.findOne({ user_fk: user_id });
        const updated_by = agencyUser.agency_user_id;
        const { whatsapp_onboarding_id } = req.params;
        const body = req.body;
        const { whatsAppOnboardingID } = await h.database.transaction(
          async (transaction) => {
            const whatsAppOnboardingID = await c.whatsappOnboarding.update(
              whatsapp_onboarding_id,
              body,
              updated_by,
              { transaction },
            );
            return whatsAppOnboardingID;
          },
        );

        if (h.notEmpty(body.status) && h.cmpStr(body.status, 'submitted')) {
          const onboarding_request = await c.whatsappOnboarding.findOne({
            whatsapp_onboarding_id: whatsapp_onboarding_id,
          });

          const agencyUserCreator = await c.agencyUser.findOne({
            agency_user_id: onboarding_request.created_by,
          });

          const user = await c.user.findOne({
            user_id: agencyUserCreator.user_fk,
          });

          const agency = await c.agency.findOne({
            agency_id: agencyUser.agency_fk,
          });

          await h.email.sendEmail(
            `Chaaat Team <support@${config?.email?.domain || 'chaaat.io'}>`,
            user.email,
            null,
            h.getMessageByCode(
              'template-onboarding-submitted-subject-1601338955192',
            ),
            h.getMessageByCode(
              'template-onboarding-submitted-body-1601338955192',
              {
                FIRST_NAME: user.first_name,
                LAST_NAME: user.last_name,
                AGENCY_NAME: agency.agency_name,
                FACEBOOK_ID: onboarding_request.facebook_manager_id,
                ONBOARDING: onboarding_request.client_company_name,
                ADDRESS: onboarding_request.address,
                EMAIL: onboarding_request.email,
                WEBSITE: onboarding_request.website,
                URL: config.webAdminUrl,
              },
            ),
          );

          const data = JSON.stringify({
            text: `<!here> WhatsApp Onboarding Request from ${agency.agency_name} has been submitted and waiting for confirmation. Thank you.`,
          });

          const notif_config = {
            method: 'post',
            url: 'https://hooks.slack.com/services/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',
            headers: {
              'Content-Type': 'application/json',
            },
            data: data,
          };

          await axios(notif_config)
            // eslint-disable-next-line promise/always-return
            .then(function (response) {
              console.log(JSON.stringify(response.data));
            })
            .catch(function (error) {
              Sentry.captureException(error);
              console.log(error);
            });
        }

        h.api.createResponse(
          req,
          res,
          200,
          { whatsAppOnboardingID },
          '1-whatsapp-onboarding-1622176015',
          {
            portal,
          },
        );
        // } else {
        //   h.api.createResponse(
        //     req,
        //     res,
        //     500,
        //     {},
        //     '3-whatsapp-onboarding-1622176015',
        //     {
        //       portal,
        //     },
        //   );
        // }
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${req.url}: user failed to update whatsapp onboarding record`,
          {
            err,
          },
        );
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-onboarding-1622176015',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/agency/whatsapp-onboarding/:agency_id Super admin staff to all onboarding submissions
   * @apiName StaffAgencyGetWhatsAppOnboardingSubmissions
   * @apiGroup Staff Agency
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency/whatsapp-onboarding/:agency_id/submissions',
    // schema: {
    //   params: {
    //     agency_id: { type: 'string' },
    //   },
    // },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAgencyAdminPermission(req, res);
    },
    handler: async (req, res) => {
      try {
        const { agency_id } = req.params;
        const { status } = req.query;
        const where = {
          agency_fk: agency_id,
        };
        if (h.notEmpty(status)) {
          where.status = {
            [Op.in]: status.split(','),
          };
        }
        const submissions = await c.whatsappOnboarding.findAll(where);
        h.api.createResponse(
          req,
          res,
          200,
          { submissions },
          '1-whatsapp-onboarding-submissions-1622176515',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-onboarding-submissions-1622176515',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/agency/whatsapp-onboarding/:whatsapp_onboarding_id Get single onboarding submission
   * @apiName StaffAgencyGetWhatsAppOnboardingSubmission
   * @apiGroup Staff Agency
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency/whatsapp-onboarding/:whatsapp_onboarding_id',
    schema: {
      params: {
        whatsapp_onboarding_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAgencyAdminPermission(req, res);
    },
    handler: async (req, res) => {
      try {
        const { whatsapp_onboarding_id } = req.params;
        const where = {
          whatsapp_onboarding_id: whatsapp_onboarding_id,
        };
        const submission = await c.whatsappOnboarding.findOne(where);
        h.api.createResponse(
          req,
          res,
          200,
          { submission },
          '1-whatsapp-onboarding-submissions-1622176515',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-onboarding-submissions-1622176515',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'DELETE',
    url: '/staff/agency/whatsapp-onboarding/:whatsapp_onboarding_id',
    schema: {
      params: {
        whatsapp_onboarding_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAgencyAdminPermission(req, res);
    },
    handler: async (req, res) => {
      try {
        const { whatsapp_onboarding_id } = req.params;
        const where = {
          whatsapp_onboarding_id: whatsapp_onboarding_id,
        };
        await c.whatsappOnboarding.destroy(where);
        h.api.createResponse(
          req,
          res,
          200,
          {},
          '1-delete-whatsapp-onboarding-submission-1622176515',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-delete-whatsapp-onboarding-submission-1622176528',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/agency/whatsapp-config Submit WABA credentials related to onboarding
   * @apiName StaffAgencyWhatsAppOnboarding
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency
   * @apiUse ServerError
   *
   * @apiParam {string} agency_id
   * @apiParam {string} waba_name
   * @apiParam {string} waba_number
   * @apiParam {string} agency_waba_id
   * @apiParam {string} agency_whatsapp_api_token
   * @apiParam {string} agency_whatsapp_api_secret
   * @apiParam {string} agency_waba_template_token
   * @apiParam {string} agency_waba_template_secret
   * @apiParam {string} agency_whatsapp_config_id
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} whatsapp_onboarding_id Onboarding ID.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "agency_id": "1234",
   * }
   */

  fastify.route({
    method: 'POST',
    url: '/staff/agency/whatsapp-config',
    schema: {
      body: {
        type: 'object',
        required: [
          'agency_id',
          'waba_name',
          'waba_number',
          'agency_waba_id',
          'agency_whatsapp_api_token',
          'agency_whatsapp_api_secret',
          'agency_waba_template_token',
          'agency_waba_template_secret',
        ],
        properties: {
          agency_id: { type: 'string' },
          waba_name: { type: 'string' },
          waba_number: { type: 'string' },
          agency_waba_id: { type: 'string' },
          agency_whatsapp_api_token: { type: 'string' },
          agency_whatsapp_api_secret: { type: 'string' },
          agency_waba_template_token: { type: 'string' },
          agency_waba_template_secret: { type: 'string' },
          whatsapp_onboarding_id: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToSuperAdminPortal(req, res);
    },
    handler: async (req, res) => {
      try {
        const { user_id } = h.user.getCurrentUser(req);
        const agencyUser = await c.agencyUser.findOne({ user_fk: user_id });
        const created_by = agencyUser.agency_user_id;
        const updated_by = created_by;
        const {
          agency_id,
          waba_name,
          waba_number,
          agency_whatsapp_api_token,
          agency_whatsapp_api_secret,
          agency_waba_id,
          agency_waba_template_token,
          agency_waba_template_secret,
          whatsapp_onboarding_id,
        } = req.body;
        const { agency_whatsapp_config_id } = await h.database.transaction(
          async (transaction) => {
            let agency_whatsapp_config_id = '';
            try {
              agency_whatsapp_config_id = await c.agencyWhatsAppConfig.create(
                {
                  agency_fk: agency_id,
                  whatsapp_onboarding_fk: whatsapp_onboarding_id,
                  waba_name,
                  waba_number,
                  agency_whatsapp_api_token,
                  agency_whatsapp_api_secret,
                  agency_waba_id,
                  agency_waba_template_token,
                  agency_waba_template_secret,
                  created_by,
                },
                { transaction: transaction },
              );
              await c.agency.update(
                agency_id,
                {
                  agency_whatsapp_api_token: 1,
                  agency_whatsapp_api_secret: 1,
                  agency_waba_id: 1,
                  agency_waba_template_token: 1,
                  agency_waba_template_secret: 1,
                },
                { transaction: transaction },
              );
            } catch (err) {
              Sentry.captureException(err);
              console.log(err);
            }
            const agencyConfig = await c.agencyConfig.findOne({
              agency_fk: agency_id,
            });

            const initial_unsubscribe_text =
              await models.unsubscribe_text.findOne({
                where: {
                  agency_fk: agency_id,
                  content: 'Unsubscribe',
                },
              });

            if (h.isEmpty(initial_unsubscribe_text)) {
              const unsubscribe_text_id = h.general.generateId();
              await models.unsubscribe_text.create({
                unsubscribe_text_id: unsubscribe_text_id,
                agency_fk: agency_id,
                content: 'Unsubscribe',
              });
            }

            if (h.isEmpty(agencyConfig)) {
              await c.agencyConfig.create(
                {
                  agency_fk: agency_id,
                  whatsapp_config: JSON.stringify({
                    is_enabled: true,
                    environment: 'whatsappcloud',
                    quick_replies: [
                      {
                        type: 'template',
                        name: 'Interested',
                        value: 'interested',
                        response: "Great, we'll contact you for more details.",
                        send_reply: true,
                        opt_out: false,
                        email: true,
                        cta_reply: 1,
                      },
                      {
                        type: 'template',
                        name: 'Not Interested',
                        value: 'not interested',
                        response:
                          'Understand, was there another better timing that may work better for you?',
                        send_reply: true,
                        opt_out: false,
                        email: true,
                        cta_reply: 2,
                      },
                      {
                        type: 'template',
                        name: 'Unsubscribe',
                        value: 'unsubscribe',
                        response:
                          'Noted! We will not send marketing messages via Whatsapp going forward to you. Do let us know if you change your mind.',
                        send_reply: true,
                        opt_out: true,
                        email: false,
                        cta_reply: 3,
                      },
                      {
                        type: 'default',
                        name: 'Replied with Text',
                        value: 'manual_reply',
                        response: '',
                        send_reply: false,
                        opt_out: false,
                        email: true,
                        cta_reply: 0,
                      },
                    ],
                  }),
                },
                { transaction: transaction },
              );
            } else {
              if (h.isEmpty(agencyConfig.whatsapp_config)) {
                await c.agencyConfig.update(
                  agencyConfig.agency_config_id,
                  {
                    whatsapp_config: JSON.stringify({
                      is_enabled: true,
                      environment: 'whatsappcloud',
                      quick_replies: [
                        {
                          type: 'template',
                          name: 'Interested',
                          value: 'interested',
                          response:
                            "Great, we'll contact you for more details.",
                          send_reply: true,
                          opt_out: false,
                          email: true,
                          cta_reply: 1,
                        },
                        {
                          type: 'template',
                          name: 'Not Interested',
                          value: 'not interested',
                          response:
                            'Understand, was there another better timing that may work better for you?',
                          send_reply: true,
                          opt_out: false,
                          email: true,
                          cta_reply: 2,
                        },
                        {
                          type: 'template',
                          name: 'Unsubscribe',
                          value: 'unsubscribe',
                          response:
                            'Noted! We will not send marketing messages via Whatsapp going forward to you. Do let us know if you change your mind.',
                          send_reply: true,
                          opt_out: true,
                          email: false,
                          cta_reply: 3,
                        },
                        {
                          type: 'default',
                          name: 'Replied with Text',
                          value: 'manual_reply',
                          response: '',
                          send_reply: false,
                          opt_out: false,
                          email: true,
                          cta_reply: 0,
                        },
                      ],
                    }),
                  },
                  updated_by,
                  { transaction },
                );
              }
            }

            if (h.notEmpty(whatsapp_onboarding_id)) {
              await c.whatsappOnboarding.update(
                whatsapp_onboarding_id,
                {
                  status: 'confirmed',
                },
                updated_by,
                { transaction },
              );

              const onboarding_request = await c.whatsappOnboarding.findOne({
                whatsapp_onboarding_id: whatsapp_onboarding_id,
              });

              const agencyUserCreator = await c.agencyUser.findOne({
                agency_user_id: onboarding_request.created_by,
              });

              const user = await c.user.findOne({
                user_id: agencyUserCreator.user_fk,
              });

              const agency = await c.agency.findOne({
                agency_id: agency_id,
              });

              await h.email.sendEmail(
                `Chaaat Team <support@${config?.email?.domain || 'chaaat.io'}>`,
                user.email,
                null,
                h.getMessageByCode(
                  'template-onboarding-confirmed-subject-1601338955192',
                ),
                h.getMessageByCode(
                  'template-onboarding-confirmed-body-1601338955192',
                  {
                    FIRST_NAME: user.first_name,
                    LAST_NAME: user.last_name,
                    AGENCY_NAME: agency.agency_name,
                    FACEBOOK_ID: onboarding_request.facebook_manager_id,
                    ONBOARDING: onboarding_request.client_company_name,
                    ADDRESS: onboarding_request.address,
                    EMAIL: onboarding_request.email,
                    WEBSITE: onboarding_request.website,
                    URL: config.webAdminUrl,
                  },
                ),
              );

              const data = JSON.stringify({
                text: `<!here> WhatsApp Onboarding Request from ${agency.agency_name} is now confirmed. Thank you.`,
              });

              const notif_config = {
                method: 'post',
                url: 'https://hooks.slack.com/services/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',
                headers: {
                  'Content-Type': 'application/json',
                },
                data: data,
              };

              await axios(notif_config)
                // eslint-disable-next-line promise/always-return
                .then(function (response) {
                  console.log(JSON.stringify(response.data));
                })
                .catch(function (error) {
                  Sentry.captureException(error);
                  console.log(error);
                });
            }
            return { agency_whatsapp_config_id };
          },
        );

        h.api.createResponse(
          req,
          res,
          200,
          { agency_whatsapp_config_id },
          '1-whatsapp-config-1622176015',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${req.url}: user failed to create new whatsapp config record`,
          {
            err,
          },
        );
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-config-1622176015',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/agency/:agency_id/messaging-stat Staff Admin get messaging stats
   * @apiName StaffAgencyGetMessagingStats
   * @apiGroup Staff Agency
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency/:agency_id/messaging-stat',
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAgencyAdminPermission(req, res);
    },
    handler: async (req, res) => {
      try {
        const { agency_id } = req.params;
        let whatsAppSentTotal = 0;
        let lineSentTotal = 0;
        let liveSentChatTotal = 0;
        let overallSentTotal = 0;

        // sent
        const whatsapp_where = {
          agency_fk: agency_id,
        };

        const line_where = {
          agency_fk: agency_id,
        };

        const live_where = {
          agency_fk: agency_id,
        };

        whatsapp_where.msg_type = {
          [Op.like]: '%frompave%',
        };
        line_where.msg_type = {
          [Op.like]: '%frompave%',
        };
        live_where.msg_type = {
          [Op.like]: '%frompave%',
        };

        whatsAppSentTotal = await c.whatsappChat.count(whatsapp_where);
        lineSentTotal = await c.lineChat.count(line_where);
        liveSentChatTotal = await c.liveChat.count(live_where);
        overallSentTotal =
          whatsAppSentTotal + lineSentTotal + liveSentChatTotal;

        // received
        let whatsAppReceivedTotal = 0;
        let lineReceivedTotal = 0;
        let liveReceivedChatTotal = 0;
        let overallReceivedTotal = 0;

        whatsapp_where.msg_type = {
          [Op.notLike]: '%frompave%',
        };
        line_where.msg_type = {
          [Op.notLike]: '%frompave%',
        };
        live_where.msg_type = {
          [Op.notLike]: '%frompave%',
        };

        whatsAppReceivedTotal = await c.whatsappChat.count(whatsapp_where);
        lineReceivedTotal = await c.lineChat.count(line_where);
        liveReceivedChatTotal = await c.liveChat.count(live_where);
        overallReceivedTotal =
          whatsAppReceivedTotal + lineReceivedTotal + liveReceivedChatTotal;
        h.api.createResponse(
          req,
          res,
          200,
          {
            sent: {
              whatsapp_total: whatsAppSentTotal,
              line_total: lineSentTotal,
              live_chat_total: liveSentChatTotal,
              overall_total: overallSentTotal,
              whatsapp_rate:
                (whatsAppSentTotal /
                  (whatsAppSentTotal + whatsAppReceivedTotal)) *
                100,
              line_rate:
                (lineSentTotal / (lineSentTotal + lineReceivedTotal)) * 100,
              live_chat_rate:
                (liveSentChatTotal /
                  (liveSentChatTotal + liveReceivedChatTotal)) *
                100,
              overall_rate:
                (overallSentTotal / (overallSentTotal + overallReceivedTotal)) *
                100,
            },
            received: {
              whatsapp_total: whatsAppReceivedTotal,
              line_total: lineReceivedTotal,
              live_chat_total: liveReceivedChatTotal,
              overall_total: overallReceivedTotal,
              whatsapp_rate:
                (whatsAppReceivedTotal /
                  (whatsAppSentTotal + whatsAppReceivedTotal)) *
                100,
              line_rate:
                (lineReceivedTotal / (lineSentTotal + lineReceivedTotal)) * 100,
              live_chat_rate:
                (liveReceivedChatTotal /
                  (liveSentChatTotal + liveReceivedChatTotal)) *
                100,
              overall_rate:
                (overallReceivedTotal /
                  (overallSentTotal + overallReceivedTotal)) *
                100,
            },
          },
          '1-agency-message-stat-1622176515',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-agency-message-stat-1622176528',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/agency/whatsapp-config/partial Submit partial WABA credentials related to onboarding
   * @apiName StaffAgencyWhatsAppOnboarding
   * @apiVersion 1.0.0
   * @apiGroup Staff Agency
   * @apiUse ServerError
   *
   * @apiParam {string} agency_id
   * @apiParam {string} waba_id
   * @apiParam {string} waba_name
   * @apiParam {string} waba_number
   * @apiParam {string} agency_whatsapp_config_id
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} whatsapp_onboarding_id Onboarding ID.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "agency_id": "1234",
   * }
   */

  fastify.route({
    method: 'POST',
    url: '/staff/agency/whatsapp-config/partial',
    schema: {
      body: {
        type: 'object',
        required: [
          'agency_id',
          'waba_name',
          'waba_number',
          'waba_id',
          'whatsapp_onboarding_id',
        ],
        properties: {
          agency_id: { type: 'string' },
          waba_name: { type: 'string' },
          waba_number: { type: 'string' },
          waba_id: { type: 'string' },
          whatsapp_onboarding_id: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAgencyAdminPermission(req, res);
    },
    handler: async (req, res) => {
      try {
        const { user_id } = h.user.getCurrentUser(req);
        const agencyUser = await c.agencyUser.findOne({ user_fk: user_id });
        const created_by = agencyUser.agency_user_id;
        const updated_by = created_by;
        const {
          agency_id,
          waba_name,
          waba_number,
          waba_id,
          whatsapp_onboarding_id,
        } = req.body;
        const { agency_whatsapp_config_id } = await h.database.transaction(
          async (transaction) => {
            let agency_whatsapp_config_id = '';
            try {
              // cleanup mobile number provided
              let processed_waba_number = waba_number.replaceAll('+', '');
              processed_waba_number = processed_waba_number.replaceAll(' ', '');
              processed_waba_number = processed_waba_number.replaceAll('(', '');
              processed_waba_number = processed_waba_number.replaceAll(')', '');
              processed_waba_number = processed_waba_number.replaceAll('-', '');
              processed_waba_number = processed_waba_number.replaceAll('.', '');

              // creating the partial whatsapp config record
              agency_whatsapp_config_id = await c.agencyWhatsAppConfig.create(
                {
                  agency_fk: agency_id,
                  whatsapp_onboarding_fk: whatsapp_onboarding_id,
                  waba_name,
                  waba_number: processed_waba_number,
                  agency_waba_id: waba_id,
                  created_by,
                },
                { transaction: transaction },
              );
            } catch (err) {
              console.log(err);
            }

            return { agency_whatsapp_config_id };
          },
        );

        h.api.createResponse(
          req,
          res,
          200,
          { agency_whatsapp_config_id },
          '1-partial-whatsapp-config-1622176015',
          {
            portal,
          },
        );
      } catch (err) {
        console.log(
          `${req.url}: user failed to create new whatsapp config partial record`,
          {
            err,
          },
        );
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-partial-whatsapp-config-1622176015',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/agency/whatsapp-config/onboarding/:whatsapp_onboarding_id get WABA config details connected to an onboarding submission
   * @apiName StaffAgencyGetWhatsAppConfigBasedOnOnboardingSubmission
   * @apiGroup Staff Agency
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency/whatsapp-config/onboarding/:whatsapp_onboarding_id',
    // schema: {
    //   params: {
    //     whatsapp_onboarding_id: { type: 'string' },
    //   },
    // },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAgencyAdminPermission(req, res);
    },
    handler: async (req, res) => {
      try {
        const { whatsapp_onboarding_id } = req.params;
        const where = {
          whatsapp_onboarding_fk: whatsapp_onboarding_id,
        };
        const agency_whatsapp_config = await c.agencyWhatsAppConfig.findOne(
          where,
        );
        h.api.createResponse(
          req,
          res,
          200,
          { agency_whatsapp_config },
          '1-whatsapp-config-1622176515',
          {
            portal,
          },
        );
      } catch (err) {
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-config-1622176515',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {delete} /v1/staff/agency/whatsapp-config/onboarding/:whatsapp_onboarding_id get WABA config details connected to an onboarding submission
   * @apiName StaffAgencyDeleteWhatsAppConfigBasedOnOnboardingSubmission
   * @apiGroup Staff Agency
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'DELETE',
    url: '/staff/agency/whatsapp-config/onboarding/:whatsapp_onboarding_id',
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAgencyAdminPermission(req, res);
    },
    handler: async (req, res) => {
      const { whatsapp_onboarding_id } = req.params;

      if (!whatsapp_onboarding_id) {
        return h.api.createResponse(
          req,
          res,
          200,
          { whatsapp_onboarding_id },
          '1-complete-whatsapp-config-1622176077',
          {
            portal,
          },
        );
      }

      const where = {
        whatsapp_onboarding_fk: whatsapp_onboarding_id,
      };

      try {
        const agency_whatsapp_config = await c.agencyWhatsAppConfig.findOne(
          where,
        );

        const whatsappOnboarding = await c.whatsappOnboarding.findOne({
          whatsapp_onboarding_id,
        });

        await c.agencyWhatsAppConfig.destroy({
          agency_whatsapp_config_id:
            agency_whatsapp_config.agency_whatsapp_config_id,
        });

        await c.whatsappOnboarding.destroy({
          whatsapp_onboarding_id: whatsappOnboarding.whatsapp_onboarding_id,
        });

        return h.api.createResponse(
          req,
          res,
          200,
          { whatsapp_onboarding_id },
          '1-complete-whatsapp-config-1622176077',
          {
            portal,
          },
        );
      } catch (err) {
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-complete-whatsapp-config-1622176077',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/agency/inventory/insights/:agency_id Staff Admin get agency inventory insights
   * @apiName StaffAgencyGetInventoryInsight
   * @apiGroup Staff Agency
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency/inventory/insights/:agency_id',
    schema: {
      params: {
        agency_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
    },
    handler: async (req, res) => {
      try {
        const { agency_id } = req.params;
        const data = await c.agencyInventory.getAgencyInventoryInsight({
          agency_id,
        });
        return h.api.createResponse(
          req,
          res,
          200,
          { data },
          '1-agency-inventory-1622176015',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error(err);
        return h.api.createResponse(
          req,
          res,
          500,
          { err },
          '2-agency-inventory-1622176015',
        );
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/staff/agency/sync-waba-details/:agency_id',
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
    },
    handler: async (req, res) => {
      const { agency_id } = req.params;
      const log = req.log.child({
        url: '/v1/staff/agency/sync-waba-details/:agency_id',
      });

      if (h.isEmpty(agency_id)) {
        return h.api.createResponse(
          req,
          res,
          400,
          {},
          '2-waba-sync-details-1622176077',
          {
            portal,
          },
        );
      }

      const agency_waba = await models.agency_whatsapp_config.findAll({
        where: {
          agency_fk: agency_id,
        },
      });

      if (h.isEmpty(agency_waba)) {
        return h.api.createResponse(
          req,
          res,
          200,
          { agency_id, agency_waba },
          '1-waba-sync-details-empty-1622176077',
          {
            portal,
          },
        );
      }

      try {
        for (const waba of agency_waba) {
          const waba_config_id = waba?.agency_whatsapp_config_id;
          const waba_id = waba?.agency_waba_id;
          const api_key = waba?.agency_waba_template_token;
          const api_secret = waba?.agency_waba_template_secret;

          const credentials = api_key + ':' + api_secret;
          const agencyBufferedCredentials = Buffer.from(
            credentials,
            'utf8',
          ).toString('base64');

          const wabaStatusConfig = {
            method: 'get',
            url: `https://template.unificationengine.com/waba/details?access_token=${waba_id}`,
            headers: {
              Authorization: `Basic ${agencyBufferedCredentials}`,
              'Content-Type': 'application/json',
            },
          };
          log.info({
            message: 'Request Config:',
            wabaStatusConfig,
          });
          const wabaStatusResponse = await axios(wabaStatusConfig)
            .then(function (response) {
              return response.data;
            })
            .catch(function (error) {
              log.warn({
                message: 'API Call Error:',
                error: error.response ? error.response.data : error.message,
              });
              return null;
            });
          req.log.info('WABA Status Response:', wabaStatusResponse);
          console.log(wabaStatusResponse?.info);
          if (
            h.cmpInt(wabaStatusResponse?.status, 200) &&
            h.notEmpty(wabaStatusResponse?.info)
          ) {
            await c.agencyWhatsAppConfig.processWABADetailsUpdate(
              waba_id,
              waba_config_id,
              wabaStatusResponse,
              log,
            );
          }
        }
        return h.api.createResponse(
          req,
          res,
          200,
          { agency_id, agency_waba },
          '1-waba-sync-details-1622176077',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        return h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-waba-sync-details-1622176077',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * Description
   * API call to generate a stripe customer billing session link
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency/:agency_id/generate-stripe-session-link',
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
    },
    handler: async (request, reply) => {
      const { agency_id } = request.params;
      const stripe = require('stripe')(config.stripe.secretKey);
      const agency = await c.agency.findOne({ agency_id });
      try {
        // const session = await stripe.billingPortal.sessions.create({
        //   customer: agency?.agency_stripe_customer_id,
        //   return_url: `${config.webAdminUrl}/billing`,
        // });
        // const session_url = session.url;
        const session_url = process.env.CUSTOMER_PORTAL_LINK;
        h.api.createResponse(
          request,
          reply,
          200,
          { session_url },
          '1-agency-stripe-payment-link',
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-agency-stripe-payment-link',
        );
      }
    },
  });

  /**
   * Description
   * API call to generate a stripe customer subscription link that allows them
   * to cancel their current subscription
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency/:agency_id/:subscription_id/generate-stripe-subscription-cancel-link',
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
    },
    handler: async (request, reply) => {
      const { agency_id, subscription_id } = request.params;
      const stripe = require('stripe')(config.stripe.secretKey);
      const agency = await c.agency.findOne({ agency_id });
      try {
        // const session = await stripe.billingPortal.sessions.create({
        //   customer: agency?.agency_stripe_customer_id,
        //   flow_data: {
        //     type: 'subscription_cancel',
        //     subscription_cancel: {
        //       subscription: subscription_id,
        //     },
        //     after_completion: {
        //       type: 'redirect',
        //       redirect: {
        //         return_url: `${config.webAdminUrl}/billing`,
        //       },
        //     },
        //   },
        //   return_url: `${config.webAdminUrl}/billing`,
        // });
        // const session_url = session.url;
        const session_url = process.env.CUSTOMER_PORTAL_LINK;
        h.api.createResponse(
          request,
          reply,
          200,
          { session_url },
          '1-agency-stripe-payment-link',
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-agency-stripe-payment-link',
        );
      }
    },
  });

  /**
   * Description
   * API call to generate a stripe payment link that allows customer to subscribe
   * to on their selected subscription plan
   * If current_subscription_id is not equal to 0, an existing subscription will
   * be cancelled first
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency/:agency_id/:stripe_price_id/generate-payment-link',
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
    },
    handler: async (request, reply) => {
      const { agency_id, stripe_price_id } = request.params;
      const { agency_stripe_customer_id } = await c.agency.findOne({
        agency_id,
      });
      const stripe = require('stripe')(config.stripe.secretKey);
      const subscription_tx = await models.sequelize.transaction();
      try {
        const paymentLink = await stripe.checkout.sessions.create({
          customer: agency_stripe_customer_id,
          success_url: `${config.webAdminUrl}/billing?checkout_session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${config.webAdminUrl}/pricing?checkout_session_id={CHECKOUT_SESSION_ID}`,
          metadata: { client_reference_id: agency_id },
          line_items: [
            {
              price: stripe_price_id,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          phone_number_collection: {
            enabled: true,
          },
          billing_address_collection: 'required',
        });
        const payment_link_url = `${paymentLink.url}`;
        await subscription_tx.commit();
        h.api.createResponse(
          request,
          reply,
          200,
          { payment_link_url },
          '1-agency-stripe-payment-link',
        );
      } catch (err) {
        await subscription_tx.rollback();
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-agency-stripe-payment-link',
        );
      }
    },
  });

  /**
   * Description
   * API call to check for active subscription clients with contact and/or
   * message capacity already maxed out
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency/check-full-subscription-capacity',
    handler: async (request, reply) => {
      try {
        await c.agencyNotification.checkFullCapacityAgencySubscription();
        h.api.createResponse(request, reply, 200, {}, '1-generic-001');
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(request, reply, 500, {}, '2-generic-001');
      }
    },
  });

  /**
   * Description
   * API call to check for active trial subscription that is about to end in 1 day
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency/check-trial-subscription',
    handler: async (request, reply) => {
      try {
        await c.agencyNotification.checkTrialAgencyToLapseTomorrow();
        h.api.createResponse(request, reply, 200, {}, '1-generic-001');
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(request, reply, 500, {}, '2-generic-001');
      }
    },
  });

  /**
   * Description
   * API call to get pricing matrix
   */
  fastify.route({
    method: 'GET',
    url: '/staff/agency/chaaat-pricing-matrix',
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
    },
    handler: async (request, reply) => {
      try {
        let data = await c.chaaatProductMatrix.findAll({});
        data = h.isEmpty(data) ? {} : data;
        h.api.createResponse(
          request,
          reply,
          200,
          { data },
          '1-matrix-1608509359974',
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          request,
          reply,
          500,
          { err },
          '2-matrix-1608510138480',
        );
      }
    },
  });

  next();
};
