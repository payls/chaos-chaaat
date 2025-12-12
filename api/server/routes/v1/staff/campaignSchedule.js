const Sentry = require('@sentry/node');
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const constant = require('../../../constants/constant.json');
const c = require('../../../controllers');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');
const agencyMiddleware = require('../../../middlewares/agency');
const models = require('../../../models');
const moment = require('moment-timezone');
const axios = require('axios');
const config = require('../../../configs/config')(process.env.NODE_ENV);

module.exports = (fastify, opts, next) => {
  /**
   * @api {get} /v1/staff/campaign-schedule List upcoming campaign schedules
   * @apiName GetUpcomingCampaignSchedules
   * @apiVersion 1.0.0
   * @apiGroup campaignSchedule
   * @apiUse ServerError
   *
   * @apiParam {string} agency_id Agency
   * @apiParam {integer} limit
   * @apiParam {integer} offset
   * @apiParam {string} sorting
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object} results List of schedules.
   * @apiSuccess {integer} total Count fo schedules
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/campaign-schedule',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    schema: {
      query: {
        agency_id: { type: 'string' },
        limit: { type: 'integer' },
        offset: { type: 'integer' },
        sorting: { type: 'string' },
      },
    },
    handler: async (req, res) => {
      try {
        const {
          agency_id,
          platform,
          limit = 50,
          offset = 0,
          sorting,
        } = req.query;

        const sortOrder = h.general.cmpStr(sorting, 'newest') ? 'DESC' : 'ASC';

        const where = {
          agency_fk: agency_id,
          slack_notification: 'campaign',
          platform: platform,
          triggered: 0,
          status: {
            [Op.in]: [1, 2],
          },
        };

        const campaignSchedules = await c.campaignSchedule.findAll(where, {
          order: [['send_date', sortOrder]],
          limit,
          offset,
        });

        for (let index = 0; index < campaignSchedules.length; index++) {
          const campaign_source = JSON.parse(
            campaignSchedules[index].campaign_source,
          );
          if (h.cmpStr(platform, 'whatsapp')) {
            const waba_id = campaign_source?.data?.selected_waba_credentials_id;

            const whatsAppConfig = await c.agencyWhatsAppConfig.findOne(
              {
                agency_whatsapp_config_id: waba_id,
              },
              {
                order: [['waba_name', 'ASC']],
              },
            );

            campaignSchedules[index].dataValues.waba_number =
              whatsAppConfig?.waba_number;
            // campaignSchedules[index].dataValues.waba_status = wabaStatus;
            campaignSchedules[index].dataValues.waba_quality_rating =
              whatsAppConfig?.waba_quality;
            campaignSchedules[index].dataValues.waba_status_rating =
              whatsAppConfig?.waba_status;
          } else if (h.cmpStr(platform, 'line')) {
            const line_channel =
              campaign_source?.data?.templates[0]?.value.line_channel;
            const lineConfig = await c.agencyChannelConfig.findOne(
              {
                agency_channel_config_id: line_channel,
                channel_type: 'line',
              },
              {
                order: [['channel_name', 'ASC']],
              },
            );
            campaignSchedules[index].dataValues.line_channel_name =
              lineConfig?.channel_name;
          }
        }

        h.api.createResponse(
          req,
          res,
          200,
          { results: campaignSchedules, total: campaignSchedules.length },
          '1-campaign-schedule-1622176002',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'GET',
          url: '/v1/staff/campaign-schedule',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-campaign-schedule-1622176015',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {put} /v1/staff/campaign-schedule/:campaign_schedule_id/pause Pause an upcoming campaign schedule
   * @apiName PauseUpcomingCampaignSchedule
   * @apiVersion 1.0.0
   * @apiGroup campaignSchedule
   * @apiUse ServerError
   *
   * @apiParam {string} agency_id Agency
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   *
   */

  fastify.route({
    method: 'PUT',
    url: '/staff/campaign-schedule/:campaign_schedule_id/pause',
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    schema: {
      params: {
        campaign_schedule_id: { type: 'string' },
      },
    },
    handler: async (request, reply) => {
      const transaction = await models.sequelize.transaction();
      const { campaign_schedule_id } = request.params;
      const portal = h.request.getPortal(request);
      try {
        const scheduleRecord = await c.campaignSchedule.findOne({
          campaign_schedule_id,
        });

        if (h.isEmpty(scheduleRecord)) {
          h.api.createResponse(
            request,
            reply,
            200,
            {},
            '2-campaign-schedule-1630304759',
            {
              portal,
            },
          );
        } else {
          await models.campaign_schedule.update(
            {
              status: 2,
            },
            {
              where: {
                campaign_schedule_id: campaign_schedule_id,
              },
              transaction,
            },
          );

          await models.campaign_schedule.update(
            {
              status: 2,
            },
            {
              where: {
                agency_fk: scheduleRecord?.agency_fk,
                campaign_name: scheduleRecord?.campaign_name,
                slack_notification: 'reminder',
              },
              transaction,
            },
          );
          await transaction.commit();
          h.api.createResponse(
            request,
            reply,
            200,
            { portal },
            '1-campaign-schedule-1652073666416',
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        await transaction.rollback();
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '3-campaign-schedule-1652073666416',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {put} /v1/staff/campaign-schedule/:campaign_schedule_id/resume Resume an upcoming campaign schedule
   *      with option to update schedule time and time zone
   * @apiName PauseUpcomingCampaignSchedule
   * @apiVersion 1.0.0
   * @apiGroup campaignSchedule
   * @apiUse ServerError
   *
   * @apiParam {string} agency_id Agency
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   *
   */

  fastify.route({
    method: 'PUT',
    url: '/staff/campaign-schedule/:campaign_schedule_id/resume',
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    schema: {
      params: {
        campaign_schedule_id: { type: 'string' },
      },
      body: {
        type: 'object',
        properties: {
          new_schedule: { type: 'string' },
          time_zone: { type: 'string' },
        },
        additionalProperties: false,
      },
    },
    handler: async (request, reply) => {
      const transaction = await models.sequelize.transaction();
      const { campaign_schedule_id } = request.params;
      const { new_schedule, time_zone } = request.body;
      const portal = h.request.getPortal(request);
      try {
        const scheduleRecord = await c.campaignSchedule.findOne({
          campaign_schedule_id,
        });

        if (h.isEmpty(scheduleRecord)) {
          h.api.createResponse(
            request,
            reply,
            200,
            {},
            '2-campaign-schedule-1630304759',
            {
              portal,
            },
          );
        } else {
          const reminderRecord = await c.campaignSchedule.findOne({
            agency_fk: scheduleRecord?.agency_fk,
            campaign_name: scheduleRecord?.campaign_name,
            slack_notification: 'reminder',
          });

          console.log(reminderRecord);

          const toUpdate = {
            status: 1,
          };

          const prevToUpdate = {
            status: 1,
          };

          if (new_schedule) {
            const sendDate = new Date(new_schedule);
            const formattedMonth = (sendDate.getMonth() + 1).toLocaleString(
              'en-US',
              { minimumIntegerDigits: 2 },
            );
            const formattedDate = sendDate
              .getDate()
              .toLocaleString('en-US', { minimumIntegerDigits: 2 });
            const hours = sendDate.getHours().toString();
            const formattedHours = hours.padStart(2, '0');
            const minutes = sendDate.getMinutes().toString();
            const formattedMinutes = minutes.padStart(2, '0');

            toUpdate.send_date =
              sendDate.getFullYear() +
              '-' +
              formattedMonth +
              '-' +
              formattedDate +
              ' ' +
              formattedHours +
              ':' +
              formattedMinutes +
              ':00';

            const oneHourBeforeDate = sendDate.setHours(
              sendDate.getHours() - 1,
            );
            const beforeFormattedMonth = (
              oneHourBeforeDate.getMonth() + 1
            ).toLocaleString('en-US', { minimumIntegerDigits: 2 });
            const beforeFormattedDate = oneHourBeforeDate
              .getDate()
              .toLocaleString('en-US', { minimumIntegerDigits: 2 });
            const beforeHours = oneHourBeforeDate.getHours().toString();
            const beforeFormattedHours = beforeHours.padStart(2, '0');
            const beforeMinutes = oneHourBeforeDate.getMinutes().toString();
            const beforeFormattedMinutes = beforeMinutes.padStart(2, '0');

            prevToUpdate.send_date =
              oneHourBeforeDate.getFullYear() +
              '-' +
              beforeFormattedMonth +
              '-' +
              beforeFormattedDate +
              ' ' +
              beforeFormattedHours +
              ':' +
              beforeFormattedMinutes +
              ':00';
          }

          if (time_zone) {
            toUpdate.time_zone = time_zone;
            prevToUpdate.time_zone = time_zone;
          }

          await models.campaign_schedule.update(toUpdate, {
            where: {
              campaign_schedule_id: campaign_schedule_id,
            },
            transaction,
          });

          await models.campaign_schedule.update(prevToUpdate, {
            where: {
              campaign_schedule_id: reminderRecord?.campaign_schedule_id,
            },
            transaction,
          });

          await transaction.commit();
          h.api.createResponse(
            request,
            reply,
            200,
            { portal },
            '1-campaign-schedule-1652073666416',
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        await transaction.rollback();
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '3-campaign-schedule-1652073666416',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {put} /v1/staff/campaign-schedule/:campaign_schedule_id/cancel Cancel an upcoming campaign schedule
   * @apiName CancelUpcomingCampaignSchedule
   * @apiVersion 1.0.0
   * @apiGroup campaignSchedule
   * @apiUse ServerError
   *
   * @apiParam {string} agency_id Agency
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   *
   */

  fastify.route({
    method: 'PUT',
    url: '/staff/campaign-schedule/:campaign_schedule_id/cancel',
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    schema: {
      params: {
        campaign_schedule_id: { type: 'string' },
      },
    },
    handler: async (request, reply) => {
      const transaction = await models.sequelize.transaction();
      const { campaign_schedule_id } = request.params;
      const portal = h.request.getPortal(request);
      try {
        const scheduleRecord = await c.campaignSchedule.findOne({
          campaign_schedule_id: campaign_schedule_id,
        });

        if (h.isEmpty(scheduleRecord)) {
          h.api.createResponse(
            request,
            reply,
            200,
            {},
            '2-campaign-schedule-1630304759',
            {
              portal,
            },
          );
        } else {
          await models.campaign_schedule.update(
            {
              status: 3,
            },
            {
              where: {
                campaign_schedule_id: campaign_schedule_id,
              },
              transaction,
            },
          );

          await models.campaign_schedule.update(
            {
              status: 3,
            },
            {
              where: {
                agency_fk: scheduleRecord?.agency_fk,
                campaign_name: scheduleRecord?.campaign_name,
                slack_notification: 'reminder',
              },
              transaction,
            },
          );

          await transaction.commit();
          h.api.createResponse(
            request,
            reply,
            200,
            { portal },
            '1-campaign-schedule-1652073666416',
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        await transaction.rollback();
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '3-campaign-schedule-1652073666416',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/campaign-schedule/:campaign_schedule_id/recipients List upcoming campaign schedule recipient
   * @apiName GetUpcomingCampaignScheduleRecipients
   * @apiVersion 1.0.0
   * @apiGroup campaignSchedule
   * @apiUse ServerError
   *
   * @apiParam {string} campaign_schedule_id Campaign Schedule ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object} results List of schedules.
   * @apiSuccess {integer} total Count fo schedules
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/campaign-schedule/:campaign_schedule_id/recipients',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    schema: {
      params: {
        campaign_schedule_id: { type: 'string' },
      },
    },
    handler: async (req, res) => {
      try {
        const { campaign_schedule_id } = req.params;

        const schedule = await c.campaignSchedule.findOne({
          campaign_schedule_id: campaign_schedule_id,
        });

        const campaign_source = JSON.parse(schedule?.campaign_source);
        const campaign_recipients = campaign_source?.data?.contact_ids;

        const schedule_recipients = await c.contact.findAll(
          {
            contact_id: {
              [Op.in]: campaign_recipients,
            },
          },
          {
            include: [
              {
                model: models.agency_user,
                required: false,
                include: [
                  {
                    model: models.user,
                    required: true,
                    attributes: ['user_id', 'first_name', 'last_name'],
                  },
                ],
                attributes: ['agency_user_id'],
              },
            ],
            attributes: [
              'contact_id',
              'first_name',
              'last_name',
              'mobile_number',
              'email',
              'is_whatsapp',
            ],
          },
        );

        h.api.createResponse(
          req,
          res,
          200,
          { schedule_recipients },
          '1-campaign-recipients-1622176002',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'GET',
          url: '/v1/staff/campaign-schedule',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-campaign-recipients-1622176015',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {put} /v1/staff/campaign-schedule/:campaign_schedule_id/delete Delete an upcoming campaign schedule
   * @apiName DeleteUpcomingCampaignSchedule
   * @apiVersion 1.0.0
   * @apiGroup campaignSchedule
   * @apiUse ServerError
   *
   * @apiParam {string} agency_id Agency
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   *
   */

  fastify.route({
    method: 'PUT',
    url: '/staff/campaign-schedule/:campaign_schedule_id/delete',
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    schema: {
      params: {
        campaign_schedule_id: { type: 'string' },
      },
    },
    handler: async (request, reply) => {
      const transaction = await models.sequelize.transaction();
      const { campaign_schedule_id } = request.params;
      const portal = h.request.getPortal(request);
      try {
        const scheduleRecord = await models.campaign_schedule.findOne({
          where: {
            campaign_schedule_id: campaign_schedule_id,
          },
          transaction,
        });

        if (h.isEmpty(scheduleRecord)) {
          h.api.createResponse(
            request,
            reply,
            200,
            {},
            '2-campaign-schedule-1630304759',
            {
              portal,
            },
          );
        } else {
          await scheduleRecord.destroy({ transaction });

          const reminderRecord = await models.campaign_schedule.findOne({
            where: {
              agency_fk: scheduleRecord?.agency_fk,
              campaign_name: scheduleRecord?.campaign_name,
              slack_notification: 'reminder',
            },
            transaction,
          });

          await reminderRecord.destroy({ transaction });

          await transaction.commit();
          h.api.createResponse(
            request,
            reply,
            200,
            { portal },
            '1-campaign-schedule-1652073666416',
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        await transaction.rollback();
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '3-campaign-schedule-1652073666416',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/campaign-schedule Create immediate or scheduled campaigns
   * @apiName CreateCampaignSchedule
   * @apiVersion 1.0.0
   * @apiGroup campaignSchedule
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   *
   */

  fastify.route({
    method: 'POST',
    url: '/staff/campaign-schedule',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
      await agencyMiddleware.canCreateCampaign(request, reply);
      await agencyMiddleware.canSendWhatsAppMessage('campaign', request, reply);
    },
    handler: async (request, response) => {
      const {
        campaign_draft_id,
        agency_id,
        campaign_name,
        campaign_type,
        templates,
        automations,
        contact_list,
        whatsApp,
        trigger_quick_reply,
        is_template,
        selected_waba_credentials_id,
        cta_response,
        cta_settings,
        schedule,
        staggered,
        timing,
        campaign_notification_additional_recipients,
      } = request.body;
      const { user_id } = h.user.getCurrentUser(request);

      const contacts = await c.contactListUser.prepareContactListForCampaign(
        contact_list,
      );
      const contact_count = contacts.length;

      if (h.cmpInt(schedule.value, 0)) {
        try {
          const result = await c.campaignSchedule.processImmediateCampaign({
            request,
            campaign_draft_id,
            campaign_name,
            user_id,
            agency_id,
            contacts,
            contact_count,
            campaign_type,
            templates,
            automations,
            whatsApp,
            trigger_quick_reply,
            is_template,
            selected_waba_credentials_id,
            cta_response,
            cta_settings,
            campaign_notification_additional_recipients,
          });
          return h.api.createResponse(
            request,
            response,
            200,
            { success: result },
            'campaign-schedule-1699538580-creation-success',
            { portal },
          );
        } catch (err) {
          request.log.error(err);
          Sentry.captureException(err);
          return h.api.createResponse(
            request,
            response,
            500,
            { err },
            'campaign-schedule-1699538580-creation-failed',
            {
              portal,
            },
          );
        }
      } else {
        const { agency_id, subscription } = await getCurrentSubscription(
          request,
        );
        if (h.cmpBool(staggered, true)) {
          try {
            await c.campaignSchedule.processStaggeredCampaign({
              agency_id,
              user_id,
              contacts,
              timing,
              subscription,
              campaign_name,
              campaign_type,
              templates,
              automations,
              whatsApp,
              trigger_quick_reply,
              is_template,
              selected_waba_credentials_id,
              cta_response,
              cta_settings,
              campaign_notification_additional_recipients,
            });

            if (!h.isEmpty(campaign_draft_id)) {
              await c.campaignDraft.markDraftAsProcessed(
                campaign_draft_id,
                user_id,
              );
            }
            await c.campaignInventory.addCampaignCount(agency_id);
            return h.api.createResponse(
              request,
              response,
              200,
              {},
              'campaign-schedule-1699538580-creation-success',
              { portal },
            );
          } catch (campaign_schedule_trasanction_err) {
            request.log.error(campaign_schedule_trasanction_err);
            Sentry.captureException(campaign_schedule_trasanction_err);
            return h.api.createResponse(
              request,
              response,
              500,
              { campaign_schedule_trasanction_err },
              'campaign-schedule-1699538580-creation-failed',
              {
                portal,
              },
            );
          }
        } else {
          try {
            await c.campaignSchedule.processSingleScheduledCampaign({
              agency_id,
              user_id,
              contacts,
              timing,
              subscription,
              campaign_name,
              campaign_type,
              templates,
              automations,
              whatsApp,
              trigger_quick_reply,
              is_template,
              selected_waba_credentials_id,
              cta_response,
              cta_settings,
              campaign_notification_additional_recipients,
            });

            if (!h.isEmpty(campaign_draft_id)) {
              await c.campaignDraft.markDraftAsProcessed(
                campaign_draft_id,
                user_id,
              );
            }
            await c.campaignInventory.addCampaignCount(agency_id);
            return h.api.createResponse(
              request,
              response,
              200,
              {},
              'campaign-schedule-1699538580-creation-success',
              { portal },
            );
          } catch (campaign_schedule_trasanction_err) {
            request.log.error(campaign_schedule_trasanction_err);
            Sentry.captureException(campaign_schedule_trasanction_err);
            return h.api.createResponse(
              request,
              response,
              500,
              { campaign_schedule_trasanction_err },
              'campaign-schedule-1699538580-creation-failed',
              {
                portal,
              },
            );
          }
        }
      }
    },
  });

  /**
   * @api {post} /v1/staff/campaign-schedule-draft Create immediate or scheduled campaigns draft
   * @apiName CreateCampaignScheduleDraft
   * @apiVersion 1.0.0
   * @apiGroup campaignSchedule
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   *
   */

  fastify.route({
    method: 'POST',
    url: '/staff/campaign-schedule-draft',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      const {
        agency_id,
        campaign_name,
        campaign_type,
        templates,
        automations,
        contact_list,
        whatsApp,
        trigger_quick_reply,
        is_template,
        selected_waba_credentials_id,
        cta_response,
        cta_settings,
        schedule,
        staggered,
        timing,
        campaign_notification_additional_recipients,
      } = request.body;

      const { user_id } = h.user.getCurrentUser(request);

      const draft_transaction = await models.sequelize.transaction();
      let campaign_draft_id;
      try {
        campaign_draft_id = await c.campaignDraft.create(
          {
            agency_fk: agency_id,
            configuration: JSON.stringify({
              agency_id,
              campaign_name,
              campaign_type,
              templates,
              automations,
              contact_list,
              whatsApp,
              trigger_quick_reply,
              is_template,
              selected_waba_credentials_id,
              cta_response,
              cta_settings,
              schedule,
              staggered,
              timing,
              campaign_notification_additional_recipients,
            }),
            status: 'draft',
            created_by: user_id,
          },
          { draft_transaction },
        );
        await draft_transaction.commit();
        h.api.createResponse(
          request,
          response,
          200,
          {},
          'campaign-schedule-1699538580-creation-success',
          { portal },
        );
      } catch (draft_transaction_err) {
        Sentry.captureException(draft_transaction_err);
        console.log(draft_transaction_err);
        await draft_transaction.rollback();
        h.api.createResponse(
          request,
          response,
          500,
          {},
          'campaign-schedule-1699538580-creation-failed',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/staff/campaign-schedule-draft/:campaign_draft_id',
    schema: {
      params: {
        campaign_draft_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { campaign_draft_id } = req.params;
      console.log(campaign_draft_id);

      try {
        const campaign_draft = await c.campaignDraft.findOne({
          campaign_draft_id: campaign_draft_id,
        });

        h.api.createResponse(
          req,
          res,
          200,
          { campaign_draft },
          '1-whatsapp-message-template-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/staff/campaign-schedule-draft/:campaign_draft_id',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-message-template-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {put} /v1/staff/campaign-schedule-draft Update immediate or scheduled campaigns draft
   * @apiName UpdateCampaignScheduleDraft
   * @apiVersion 1.0.0
   * @apiGroup campaignSchedule
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   *
   */

  fastify.route({
    method: 'PUT',
    url: '/staff/campaign-schedule-draft/:campaign_draft_id',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      const { campaign_draft_id } = request.params;
      const {
        agency_id,
        campaign_name,
        campaign_type,
        templates,
        automations,
        contact_list,
        whatsApp,
        trigger_quick_reply,
        is_template,
        selected_waba_credentials_id,
        cta_response,
        cta_settings,
        schedule,
        staggered,
        timing,
        campaign_notification_additional_recipients,
      } = request.body;

      const { user_id } = h.user.getCurrentUser(request);

      const draft_transaction = await models.sequelize.transaction();
      try {
        await c.campaignDraft.update(
          campaign_draft_id,
          {
            agency_fk: agency_id,
            configuration: JSON.stringify({
              agency_id,
              campaign_name,
              campaign_type,
              templates,
              automations,
              contact_list,
              whatsApp,
              trigger_quick_reply,
              is_template,
              selected_waba_credentials_id,
              cta_response,
              cta_settings,
              schedule,
              staggered,
              timing,
              campaign_notification_additional_recipients,
            }),
            status: 'draft',
          },
          user_id,
          { draft_transaction },
        );
        await draft_transaction.commit();
        h.api.createResponse(
          request,
          response,
          200,
          {},
          'campaign-schedule-1699538580-creation-success',
          { portal },
        );
      } catch (draft_transaction_err) {
        Sentry.captureException(draft_transaction_err);
        console.log(draft_transaction_err);
        await draft_transaction.rollback();
        h.api.createResponse(
          request,
          response,
          500,
          {},
          'campaign-schedule-1699538580-creation-failed',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/campaign-schedule-draft-review Create immediate or scheduled campaigns draft and submit for review
   * @apiName CreateCampaignScheduleDraftReview
   * @apiVersion 1.0.0
   * @apiGroup campaignSchedule
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   *
   */

  fastify.route({
    method: 'POST',
    url: '/staff/campaign-schedule-draft-review',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      const {
        agency_id,
        campaign_name,
        campaign_type,
        templates,
        automations,
        contact_list,
        whatsApp,
        trigger_quick_reply,
        is_template,
        selected_waba_credentials_id,
        cta_response,
        cta_settings,
        schedule,
        staggered,
        timing,
        campaign_notification_additional_recipients,
      } = request.body;

      const { user_id } = h.user.getCurrentUser(request);

      const draft_transaction = await models.sequelize.transaction();
      let campaign_draft_id;
      try {
        campaign_draft_id = await c.campaignDraft.create(
          {
            agency_fk: agency_id,
            configuration: JSON.stringify({
              agency_id,
              campaign_name,
              campaign_type,
              templates,
              automations,
              contact_list,
              whatsApp,
              trigger_quick_reply,
              is_template,
              selected_waba_credentials_id,
              cta_response,
              cta_settings,
              schedule,
              staggered,
              timing,
              campaign_notification_additional_recipients,
            }),
            status: 'review',
            created_by: user_id,
          },
          { draft_transaction },
        );
        await draft_transaction.commit();

        const agency = await c.agency.findOne({ agency_id });
        const { agency_name } = agency;
        if (!h.isEmpty(agency?.campaign_approval_agent)) {
          const approvers = agency?.campaign_approval_agent;
          const approverIDs = approvers.split(',');
          const approverAgents = await c.agencyUser.findAll(
            {
              agency_user_id: {
                [Op.in]: approverIDs,
              },
            },
            {
              include: [{ model: models.user, required: true }],
            },
          );
          approverAgents.forEach(async (agent) => {
            const user = agent?.dataValues?.user?.dataValues;

            const email_subject = h.getMessageByCode(
              'campaign-draft-ready-for-review-subject-1639636972368',
              {
                AGENCY: agency_name,
              },
            );
            const email_body = h.getMessageByCode(
              'campaign-draft-ready-for-review-body-1651855722401',
              {
                AGENT_FIRST_NAME: user.first_name,
                CAMPAIGN_DRAFT_NAME: campaign_name,
                REVIEW_LINK:
                  config?.webAdminUrl +
                  '/whatsapp/campaign/review?campaign_draft_id=' +
                  campaign_draft_id,
              },
            );
            await h.email.sendEmail(
              `Chaaat Team <no-reply@${config?.email?.domain || 'chaaat.io'}>`,
              user.email,
              null,
              email_subject,
              email_body,
            );
          });

          const data = JSON.stringify({
            text: `<!here> Campaign draft for ${agency_name} with name ${campaign_name} ready for review. Thank you.`,
          });

          const review_config = {
            method: 'post',
            url: 'https://hooks.slack.com/services/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',
            headers: {
              'Content-Type': 'application/json',
            },
            data: data,
          };

          await axios(review_config)
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
          request,
          response,
          200,
          {},
          'campaign-schedule-1699538580-creation-success',
          { portal },
        );
      } catch (draft_transaction_err) {
        Sentry.captureException(draft_transaction_err);
        console.log(draft_transaction_err);
        await draft_transaction.rollback();
        h.api.createResponse(
          request,
          response,
          500,
          {},
          'campaign-schedule-1699538580-creation-failed',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {put} /v1/staff/campaign-schedule-draft-review Update immediate or scheduled campaigns draft and for review
   * @apiName UpdateCampaignScheduleDraftReview
   * @apiVersion 1.0.0
   * @apiGroup campaignSchedule
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   *
   */

  fastify.route({
    method: 'PUT',
    url: '/staff/campaign-schedule-draft-review/:campaign_draft_id',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      const { campaign_draft_id } = request.params;
      const {
        agency_id,
        campaign_name,
        campaign_type,
        templates,
        automations,
        contact_list,
        whatsApp,
        trigger_quick_reply,
        is_template,
        selected_waba_credentials_id,
        cta_response,
        cta_settings,
        schedule,
        staggered,
        timing,
        campaign_notification_additional_recipients,
      } = request.body;

      const { user_id } = h.user.getCurrentUser(request);

      const draft_transaction = await models.sequelize.transaction();
      try {
        await c.campaignDraft.update(
          campaign_draft_id,
          {
            agency_fk: agency_id,
            configuration: JSON.stringify({
              agency_id,
              campaign_name,
              campaign_type,
              templates,
              automations,
              contact_list,
              whatsApp,
              trigger_quick_reply,
              is_template,
              selected_waba_credentials_id,
              cta_response,
              cta_settings,
              schedule,
              staggered,
              timing,
              campaign_notification_additional_recipients,
            }),
            status: 'review',
          },
          user_id,
          { draft_transaction },
        );
        await draft_transaction.commit();

        const agency = await c.agency.findOne({ agency_id });
        const { agency_name } = agency;
        if (!h.isEmpty(agency?.campaign_approval_agent)) {
          const approvers = agency?.campaign_approval_agent;
          const approverIDs = approvers.split(',');
          const approverAgents = await c.agencyUser.findAll(
            {
              agency_user_id: {
                [Op.in]: approverIDs,
              },
            },
            {
              include: [{ model: models.user, required: true }],
            },
          );
          approverAgents.forEach(async (agent) => {
            const user = agent?.dataValues?.user?.dataValues;

            const email_subject = h.getMessageByCode(
              'campaign-draft-ready-for-review-subject-1639636972368',
              {
                AGENCY: agency_name,
              },
            );
            const email_body = h.getMessageByCode(
              'campaign-draft-ready-for-review-body-1651855722401',
              {
                AGENT_FIRST_NAME: user.first_name,
                CAMPAIGN_DRAFT_NAME: campaign_name,
                REVIEW_LINK:
                  config?.webAdminUrl +
                  '/whatsapp/campaign/review?campaign_draft_id=' +
                  campaign_draft_id,
              },
            );
            await h.email.sendEmail(
              `Chaaat Team <no-reply@${config?.email?.domain || 'chaaat.io'}>`,
              user.email,
              null,
              email_subject,
              email_body,
            );
          });

          const data = JSON.stringify({
            text: `<!here> Campaign draft for ${agency_name} with name ${campaign_name} ready for review. Thank you.`,
          });

          const review_config = {
            method: 'post',
            url: 'https://hooks.slack.com/services/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',
            headers: {
              'Content-Type': 'application/json',
            },
            data: data,
          };

          await axios(review_config)
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
          request,
          response,
          200,
          {},
          'campaign-schedule-1699538580-creation-success',
          { portal },
        );
      } catch (draft_transaction_err) {
        Sentry.captureException(draft_transaction_err);
        console.log(draft_transaction_err);
        await draft_transaction.rollback();
        h.api.createResponse(
          request,
          response,
          500,
          {},
          'campaign-schedule-1699538580-creation-failed',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/campaign-schedule-draft-list List campaign drafts and for reviews
   * @apiName GetCampaignDraftsAndForReviews
   * @apiVersion 1.0.0
   * @apiGroup campaignSchedule
   * @apiUse ServerError
   *
   * @apiParam {string} agency_id Agency
   * @apiParam {integer} limit
   * @apiParam {integer} offset
   * @apiParam {string} sorting
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {object} results List of schedules.
   * @apiSuccess {integer} total Count fo schedules
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/campaign-schedule-draft-list',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    schema: {
      query: {
        agency_id: { type: 'string' },
        platform: { type: 'string' },
        limit: { type: 'integer' },
        offset: { type: 'integer' },
        sorting: { type: 'string' },
      },
    },
    handler: async (req, res) => {
      try {
        const {
          agency_id,
          platform,
          limit = 50,
          offset = 0,
          sorting,
        } = req.query;

        const sortOrder = h.general.cmpStr(sorting, 'newest') ? 'DESC' : 'ASC';

        const where = {
          agency_fk: agency_id,
          platform: platform,
          status: {
            [Op.in]: ['draft', 'review'],
          },
        };

        const campaignDrafts = await c.campaignDraft.findAll(where, {
          order: [['created_date', sortOrder]],
          limit,
          offset,
        });

        for (let index = 0; index < campaignDrafts.length; index++) {
          const campaign_source = JSON.parse(
            campaignDrafts[index].configuration,
          );
          if (h.cmpStr(platform, 'whatsapp')) {
            const waba_id = campaign_source?.selected_waba_credentials_id;
            const whatsAppConfig = await c.agencyWhatsAppConfig.findOne(
              {
                agency_whatsapp_config_id: waba_id,
              },
              {
                order: [['waba_name', 'ASC']],
              },
            );
            campaignDrafts[index].dataValues.waba_number =
              whatsAppConfig?.waba_number;
            // campaignSchedules[index].dataValues.waba_status = wabaStatus;
            campaignDrafts[index].dataValues.waba_quality_rating =
              whatsAppConfig?.waba_quality;
            campaignDrafts[index].dataValues.waba_status_rating =
              whatsAppConfig?.waba_status;
          } else if (h.cmpStr(platform, 'line')) {
            const line_channel = campaign_source?.selected_line_channel;
            const lineConfig = await c.agencyChannelConfig.findOne(
              {
                agency_channel_config_id: line_channel,
                channel_type: 'line',
              },
              {
                order: [['channel_name', 'ASC']],
              },
            );
            campaignDrafts[index].dataValues.line_channel_name =
              lineConfig?.channel_name;
          }

          let batch_count = 0;
          const contact_list = campaign_source.contact_list;

          for (let cIndex = 0; cIndex < contact_list.length; cIndex++) {
            batch_count += contact_list[cIndex].value.contact_count.count;
          }

          campaignDrafts[index].dataValues.broadcast_date =
            campaignDrafts[index].created_date;
          campaignDrafts[index].dataValues.recipient_count = batch_count;
          campaignDrafts[index].dataValues.campaign_name_label =
            campaign_source.campaign_name;
        }

        h.api.createResponse(
          req,
          res,
          200,
          { results: campaignDrafts, total: campaignDrafts.length },
          '1-campaign-draft-list-1622176002',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'GET',
          url: '/v1/staff/campaign-schedule-draft-list',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-campaign-draft-list-1622176015',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {delete} /v1/staff/campaign-draft/:campaign_draft_id Staff delete draft
   * @apiName StaffDeleteCampaignDraft
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact List User
   * @apiUse ServerError
   *
   **/
  fastify.route({
    method: 'DELETE',
    url: '/staff/campaign-draft/:campaign_draft_id',
    schema: {
      params: {
        campaign_draft_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { campaign_draft_id } = req.params;

      try {
        const campaign_draft = await c.campaignDraft.findOne({
          campaign_draft_id: campaign_draft_id,
        });

        if (campaign_draft) {
          await c.campaignDraft.destroy({
            campaign_draft_id: campaign_draft_id,
          });

          h.api.createResponse(
            req,
            res,
            200,
            {},
            '1-delete-campaign-draft-1663834299369',
            {
              portal,
            },
          );
        } else {
          throw new Error(`Campaign draft not found.`);
        }
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/campaign-draft/:campaign_draft_id',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-delete-campaign-draft-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/line-campaign-schedule-draft Create immediate or scheduled line campaigns draft
   * @apiName CreateLineCampaignScheduleDraft
   * @apiVersion 1.0.0
   * @apiGroup campaignSchedule
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   *
   */

  fastify.route({
    method: 'POST',
    url: '/staff/line-campaign-schedule-draft',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      const {
        campaign_name,
        agency_id,
        campaign_type,
        templates,
        automations,
        contact_list,
        selected_line_channel,
        api_token,
        api_secret,
        schedule,
        staggered,
        timing,
        campaign_notification_additional_recipients,
      } = request.body;

      const { user_id } = h.user.getCurrentUser(request);

      const draft_transaction = await models.sequelize.transaction();
      let campaign_draft_id;
      try {
        campaign_draft_id = await c.campaignDraft.create(
          {
            agency_fk: agency_id,
            configuration: JSON.stringify({
              agency_id,
              campaign_name,
              campaign_type,
              templates,
              automations,
              contact_list,
              selected_line_channel,
              api_token,
              api_secret,
              schedule,
              staggered,
              timing,
              campaign_notification_additional_recipients,
            }),
            platform: 'line',
            status: 'draft',
            created_by: user_id,
          },
          { draft_transaction },
        );
        await draft_transaction.commit();
        h.api.createResponse(
          request,
          response,
          200,
          {},
          'campaign-schedule-1699538580-creation-success',
          { portal },
        );
      } catch (draft_transaction_err) {
        Sentry.captureException(draft_transaction_err);
        console.log(draft_transaction_err);
        await draft_transaction.rollback();
        h.api.createResponse(
          request,
          response,
          500,
          {},
          'campaign-schedule-1699538580-creation-failed',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {put} /v1/staff/campaign-schedule-draft/line Update immediate or scheduled Line campaigns draft
   * @apiName UpdateLineCampaignScheduleDraft
   * @apiVersion 1.0.0
   * @apiGroup campaignSchedule
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   *
   */

  fastify.route({
    method: 'PUT',
    url: '/staff/campaign-schedule-draft/line/:campaign_draft_id',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      const { campaign_draft_id } = request.params;
      const {
        campaign_name,
        agency_id,
        campaign_type,
        templates,
        automations,
        contact_list,
        selected_line_channel,
        api_token,
        api_secret,
        schedule,
        staggered,
        timing,
        campaign_notification_additional_recipients,
      } = request.body;

      const { user_id } = h.user.getCurrentUser(request);

      const draft_transaction = await models.sequelize.transaction();
      try {
        await c.campaignDraft.update(
          campaign_draft_id,
          {
            agency_fk: agency_id,
            configuration: JSON.stringify({
              agency_id,
              campaign_name,
              campaign_type,
              templates,
              automations,
              contact_list,
              selected_line_channel,
              api_token,
              api_secret,
              schedule,
              staggered,
              timing,
              campaign_notification_additional_recipients,
            }),
            platform: 'line',
            status: 'draft',
          },
          user_id,
          { draft_transaction },
        );
        await draft_transaction.commit();
        h.api.createResponse(
          request,
          response,
          200,
          {},
          'campaign-schedule-1699538580-creation-success',
          { portal },
        );
      } catch (draft_transaction_err) {
        Sentry.captureException(draft_transaction_err);
        console.log(draft_transaction_err);
        await draft_transaction.rollback();
        h.api.createResponse(
          request,
          response,
          500,
          {},
          'campaign-schedule-1699538580-creation-failed',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/campaign-schedule-draft-review/line Create immediate or scheduled Line campaigns draft and submit for review
   * @apiName CreateLineCampaignScheduleDraftReview
   * @apiVersion 1.0.0
   * @apiGroup campaignSchedule
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   *
   */

  fastify.route({
    method: 'POST',
    url: '/staff/campaign-schedule-draft-review/line',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      const {
        campaign_name,
        agency_id,
        campaign_type,
        templates,
        automations,
        contact_list,
        selected_line_channel,
        api_token,
        api_secret,
        schedule,
        staggered,
        timing,
        campaign_notification_additional_recipients,
      } = request.body;

      const { user_id } = h.user.getCurrentUser(request);

      const draft_transaction = await models.sequelize.transaction();
      let campaign_draft_id;
      try {
        campaign_draft_id = await c.campaignDraft.create(
          {
            agency_fk: agency_id,
            configuration: JSON.stringify({
              campaign_name,
              agency_id,
              campaign_type,
              templates,
              automations,
              contact_list,
              selected_line_channel,
              api_token,
              api_secret,
              schedule,
              staggered,
              timing,
              campaign_notification_additional_recipients,
            }),
            platform: 'line',
            status: 'review',
            created_by: user_id,
          },
          { draft_transaction },
        );
        await draft_transaction.commit();

        const agency = await c.agency.findOne({ agency_id });
        const { agency_name } = agency;
        if (!h.isEmpty(agency?.campaign_approval_agent)) {
          const approvers = agency?.campaign_approval_agent;
          const approverIDs = approvers.split(',');
          const approverAgents = await c.agencyUser.findAll(
            {
              agency_user_id: {
                [Op.in]: approverIDs,
              },
            },
            {
              include: [{ model: models.user, required: true }],
            },
          );
          approverAgents.forEach(async (agent) => {
            const user = agent?.dataValues?.user?.dataValues;

            const email_subject = h.getMessageByCode(
              'campaign-draft-ready-for-review-subject-1639636972368',
              {
                AGENCY: agency_name,
              },
            );
            const email_body = h.getMessageByCode(
              'campaign-draft-ready-for-review-body-1651855722401',
              {
                AGENT_FIRST_NAME: user.first_name,
                CAMPAIGN_DRAFT_NAME: campaign_name,
                REVIEW_LINK:
                  config?.webAdminUrl +
                  '/line/campaign/review?campaign_draft_id=' +
                  campaign_draft_id,
              },
            );
            await h.email.sendEmail(
              `Chaaat Team <no-reply@${config?.email?.domain || 'chaaat.io'}>`,
              user.email,
              null,
              email_subject,
              email_body,
            );
          });

          const data = JSON.stringify({
            text: `<!here> Campaign draft for ${agency_name} with name ${campaign_name} ready for review. Thank you.`,
          });

          const review_config = {
            method: 'post',
            url: 'https://hooks.slack.com/services/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',
            headers: {
              'Content-Type': 'application/json',
            },
            data: data,
          };

          await axios(review_config)
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
          request,
          response,
          200,
          {},
          'campaign-schedule-1699538580-creation-success',
          { portal },
        );
      } catch (draft_transaction_err) {
        Sentry.captureException(draft_transaction_err);
        console.log(draft_transaction_err);
        await draft_transaction.rollback();
        h.api.createResponse(
          request,
          response,
          500,
          {},
          'campaign-schedule-1699538580-creation-failed',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {put} /v1/staff/campaign-schedule-draft-review/line Update immediate or scheduled Line campaigns draft and for review
   * @apiName UpdateLineCampaignScheduleDraftReview
   * @apiVersion 1.0.0
   * @apiGroup campaignSchedule
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   *
   */

  fastify.route({
    method: 'PUT',
    url: '/staff/campaign-schedule-draft-review/line/:campaign_draft_id',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      const { campaign_draft_id } = request.params;
      const {
        campaign_name,
        agency_id,
        campaign_type,
        templates,
        automations,
        contact_list,
        selected_line_channel,
        api_token,
        api_secret,
        schedule,
        staggered,
        timing,
        campaign_notification_additional_recipients,
      } = request.body;

      const { user_id } = h.user.getCurrentUser(request);

      const draft_transaction = await models.sequelize.transaction();
      try {
        await c.campaignDraft.update(
          campaign_draft_id,
          {
            agency_fk: agency_id,
            configuration: JSON.stringify({
              campaign_name,
              agency_id,
              campaign_type,
              templates,
              automations,
              contact_list,
              selected_line_channel,
              api_token,
              api_secret,
              schedule,
              staggered,
              timing,
              campaign_notification_additional_recipients,
            }),
            platform: 'line',
            status: 'review',
          },
          user_id,
          { draft_transaction },
        );
        await draft_transaction.commit();

        const agency = await c.agency.findOne({ agency_id });
        const { agency_name } = agency;
        if (!h.isEmpty(agency?.campaign_approval_agent)) {
          const approvers = agency?.campaign_approval_agent;
          const approverIDs = approvers.split(',');
          const approverAgents = await c.agencyUser.findAll(
            {
              agency_user_id: {
                [Op.in]: approverIDs,
              },
            },
            {
              include: [{ model: models.user, required: true }],
            },
          );
          approverAgents.forEach(async (agent) => {
            const user = agent?.dataValues?.user?.dataValues;

            const email_subject = h.getMessageByCode(
              'campaign-draft-ready-for-review-subject-1639636972368',
              {
                AGENCY: agency_name,
              },
            );
            const email_body = h.getMessageByCode(
              'campaign-draft-ready-for-review-body-1651855722401',
              {
                AGENT_FIRST_NAME: user.first_name,
                CAMPAIGN_DRAFT_NAME: campaign_name,
                REVIEW_LINK:
                  config?.webAdminUrl +
                  '/whatsapp/campaign/review?campaign_draft_id=' +
                  campaign_draft_id,
              },
            );
            await h.email.sendEmail(
              `Chaaat Team <no-reply@${config?.email?.domain || 'chaaat.io'}>`,
              user.email,
              null,
              email_subject,
              email_body,
            );
          });

          const data = JSON.stringify({
            text: `<!here> Campaign draft for ${agency_name} with name ${campaign_name} ready for review. Thank you.`,
          });

          const review_config = {
            method: 'post',
            url: 'https://hooks.slack.com/services/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',
            headers: {
              'Content-Type': 'application/json',
            },
            data: data,
          };

          await axios(review_config)
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
          request,
          response,
          200,
          {},
          'campaign-schedule-1699538580-creation-success',
          { portal },
        );
      } catch (draft_transaction_err) {
        Sentry.captureException(draft_transaction_err);
        console.log(draft_transaction_err);
        await draft_transaction.rollback();
        h.api.createResponse(
          request,
          response,
          500,
          {},
          'campaign-schedule-1699538580-creation-failed',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/campaign-schedule Create immediate or scheduled campaigns
   * @apiName CreateCampaignSchedule
   * @apiVersion 1.0.0
   * @apiGroup campaignSchedule
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   *
   */

  fastify.route({
    method: 'POST',
    url: '/staff/campaign-schedule/line',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      const {
        campaign_draft_id,
        campaign_name,
        agency_id,
        campaign_type,
        templates,
        automations,
        contact_list,
        selected_line_channel,
        api_token,
        api_secret,
        schedule,
        staggered,
        timing,
        campaign_notification_additional_recipients,
      } = request.body;
      console.log(campaign_draft_id);
      const { user_id } = h.user.getCurrentUser(request);

      // creating proposal template
      const proposal_transaction = await models.sequelize.transaction();
      let proposal_template_id;
      try {
        proposal_template_id = await c.proposalTemplate.create(
          {
            name: campaign_name,
            agency_fk: agency_id,
          },
          { proposal_transaction },
        );
        await proposal_transaction.commit();
      } catch (proposal_transaction_err) {
        Sentry.captureException(proposal_transaction_err);
        console.log(proposal_transaction_err);
        await proposal_transaction.rollback();
        h.api.createResponse(
          request,
          response,
          500,
          {},
          'campaign-schedule-1699538580-creation-failed',
          {
            portal,
          },
        );
      }

      // handling proposal project/product
      const project_transaction = await models.sequelize.transaction();
      let project_id;
      try {
        const project = await c.project.findOne(
          {
            agency_fk: agency_id,
            name: campaign_name,
          },
          {
            transaction: project_transaction,
          },
        );
        if (project) {
          project_id = project.project_id;
        } else {
          project_id = await c.project.create(
            {
              name: campaign_name,
              agency_fk: agency_id,
            },
            { project_transaction },
          );
        }
        await project_transaction.commit();
      } catch (project_transaction_err) {
        Sentry.captureException(project_transaction_err);
        console.log(project_transaction_err);
        await project_transaction.rollback();
        h.api.createResponse(
          request,
          response,
          500,
          { project_transaction_err },
          'campaign-schedule-1699538580-creation-failed',
          {
            portal,
          },
        );
      }

      if (proposal_template_id && project_id) {
        const shortlisted_project_proposal_transaction =
          await models.sequelize.transaction();
        try {
          await c.shortlistedProjectProposalTemplate.create(
            {
              project_fk: project_id,
              display_order: 1,
              proposal_template_fk: proposal_template_id,
              is_deleted: 0,
              created_by: user_id,
            },
            { shortlisted_project_proposal_transaction },
          );
          await shortlisted_project_proposal_transaction.commit();
        } catch (shortlisted_project_proposal_transaction_err) {
          Sentry.captureException(shortlisted_project_proposal_transaction_err);
          console.log(shortlisted_project_proposal_transaction_err);
          await shortlisted_project_proposal_transaction.rollback();
          h.api.createResponse(
            request,
            response,
            500,
            { shortlisted_project_proposal_transaction_err },
            'campaign-schedule-1699538580-creation-failed',
            {
              portal,
            },
          );
        }
      }

      const contactLists = contact_list.map(
        (item) => item.value.contact_list_id,
      );
      const contact_list_users = await c.contactListUser.findAll(
        {
          contact_list_id: {
            [Op.in]: contactLists,
          },
        },
        {
          attributes: [],
          include: [
            {
              model: models.contact,
              required: true,
              where: {
                [Op.and]: [
                  {
                    opt_out_line: 0,
                  },
                  // {
                  //   [Op.or]: [
                  //     {
                  //       whatsapp_engagement: 'all',
                  //     },
                  //     {
                  //       whatsapp_engagement: {
                  //         [Op.like]: `%campaign%`,
                  //       },
                  //     },
                  //   ],
                  // },
                ],
              },
              attributes: ['contact_id'],
            },
          ],
        },
      );

      const contacts = [];
      for (const contact_list of contact_list_users) {
        contacts.push(contact_list.contact.dataValues.contact_id);
      }

      if (h.cmpInt(schedule.value, 0)) {
        try {
          const frontend_schedule_date = new Date();
          const timeZone = 'Asia/Manila';
          let tracker_ref_name = moment
            .tz(frontend_schedule_date, timeZone)
            .format('YYYYMMDDHHmm00');
          let lower_case_campaign_name = campaign_name.replace(
            /[^a-zA-Z0-9\s]/g,
            '',
          );
          lower_case_campaign_name = lower_case_campaign_name
            .toLowerCase()
            .replace(/\s+/g, '_');

          tracker_ref_name = tracker_ref_name + '_' + lower_case_campaign_name;
          const data = {
            user_id,
            agency_id,
            assigned_tracker_ref_name: tracker_ref_name,
            campaign_name: tracker_ref_name,
            campaign_name_label: campaign_name,
            contact_ids: contacts,
            selected_line_channel,
            api_token,
            api_secret,
            campaign_type,
            templates,
            automations,
            proposal: proposal_template_id,
            campaign_notification_additional_recipients,
          };

          if (!h.isEmpty(campaign_draft_id)) {
            await c.campaignDraft.update(
              campaign_draft_id,
              {
                status: 'processed',
              },
              user_id,
            );
          }
          const result = await request.rabbitmq.pubBulkProcessLineCampaign({
            data,
            consumerType:
              constant.AMQ.CONSUMER_TYPES.BULK_PROCESS_LINE_CAMPAIGN,
          });
          h.api.createResponse(
            request,
            response,
            200,
            { success: result },
            'campaign-schedule-1699538580-creation-success',
            { portal },
          );
        } catch (err) {
          Sentry.captureException(err);
          h.api.createResponse(
            request,
            response,
            500,
            { err },
            'campaign-schedule-1699538580-creation-failed',
            {
              portal,
            },
          );
        }
      } else {
        if (h.cmpBool(staggered, true)) {
          const campaign_schedule_trasanction =
            await models.sequelize.transaction();
          try {
            let index = 1;
            for (const sched of timing) {
              if (!h.isEmpty(contacts)) {
                const payload = {
                  consumerType: 'BULK_PROCESS_LINE_CAMPAIGN',
                  data: {},
                };
                const contact_batch = contacts.splice(0, sched.recipient_count);
                console.log(contact_batch.length);

                const frontend_schedule_date = sched.datetime;
                const timeZone = 'Asia/Manila';
                const originalnSchedule = moment.tz(
                  frontend_schedule_date,
                  timeZone,
                );
                const campaignSchedule = moment
                  .tz(frontend_schedule_date, timeZone)
                  .format('YYYY-MM-DD HH:mm:ss');
                const oneHourBefore = originalnSchedule
                  .clone()
                  .subtract(1, 'hour')
                  .format('YYYY-MM-DD HH:mm:ss');
                let tracker_ref_name = moment
                  .tz(frontend_schedule_date, timeZone)
                  .format('YYYYMMDDHHmm00');
                let lower_case_campaign_name = campaign_name.replace(
                  /[^a-zA-Z0-9\s]/g,
                  '',
                );
                lower_case_campaign_name = lower_case_campaign_name
                  .toLowerCase()
                  .replace(/\s+/g, '_');

                tracker_ref_name =
                  tracker_ref_name +
                  '_' +
                  lower_case_campaign_name +
                  '_' +
                  index;

                const campaign_name_label = campaign_name + ' ' + index;
                console.log(tracker_ref_name, campaign_name_label);
                const data = {
                  user_id,
                  agency_id,
                  assigned_tracker_ref_name: tracker_ref_name,
                  campaign_name: tracker_ref_name,
                  campaign_name_label: campaign_name,
                  contact_ids: contacts,
                  selected_line_channel,
                  api_token,
                  api_secret,
                  campaign_type,
                  templates,
                  automations,
                  proposal: proposal_template_id,
                  campaign_notification_additional_recipients,
                };
                payload.data = data;
                await c.campaignSchedule.create(
                  {
                    agency_fk: agency_id,
                    campaign_name: campaign_name_label,
                    recipient_count: contact_batch.length,
                    slack_notification: 'reminder',
                    campaign_source: '1 hour',
                    send_date: oneHourBefore,
                    time_zone: timeZone,
                    platform: 'line',
                    status: 1,
                    triggered: 0,
                  },
                  { campaign_schedule_trasanction },
                );

                await c.campaignSchedule.create(
                  {
                    agency_fk: agency_id,

                    tracker_ref_name: tracker_ref_name,
                    campaign_name: campaign_name_label,
                    recipient_count: contact_batch.length,
                    slack_notification: 'campaign',
                    campaign_source: JSON.stringify(payload),
                    send_date: campaignSchedule,
                    time_zone: timeZone,
                    platform: 'line',
                    status: 1,
                    triggered: 0,
                  },
                  { campaign_schedule_trasanction },
                );
                index++;
              }
            }

            if (!h.isEmpty(campaign_draft_id)) {
              await c.campaignDraft.update(
                campaign_draft_id,
                {
                  status: 'processed',
                },
                user_id,
                { campaign_schedule_trasanction },
              );
            }
            await campaign_schedule_trasanction.commit();
            h.api.createResponse(
              request,
              response,
              200,
              {},
              'campaign-schedule-1699538580-creation-success',
              { portal },
            );
          } catch (campaign_schedul_trasanction_err) {
            Sentry.captureException(campaign_schedul_trasanction_err);
            console.log(campaign_schedul_trasanction_err);
            await campaign_schedule_trasanction.rollback();
            h.api.createResponse(
              request,
              response,
              500,
              { campaign_schedul_trasanction_err },
              'campaign-schedule-1699538580-creation-failed',
              {
                portal,
              },
            );
          }
        } else {
          const campaign_schedule_trasanction =
            await models.sequelize.transaction();
          try {
            for (const sched of timing) {
              const payload = {
                consumerType: 'BULK_PROCESS_LINE_CAMPAIGN',
                data: {},
              };
              const frontend_schedule_date = sched.datetime;
              const timeZone = 'Asia/Manila';
              const originalnSchedule = moment.tz(
                frontend_schedule_date,
                timeZone,
              );
              const campaignSchedule = moment
                .tz(frontend_schedule_date, timeZone)
                .format('YYYY-MM-DD HH:mm:00');
              const oneHourBefore = originalnSchedule
                .clone()
                .subtract(1, 'hour')
                .format('YYYY-MM-DD HH:mm:00');
              let tracker_ref_name = moment
                .tz(frontend_schedule_date, timeZone)
                .format('YYYYMMDDHHmm00');
              let lower_case_campaign_name = campaign_name.replace(
                /[^a-zA-Z0-9\s]/g,
                '',
              );
              lower_case_campaign_name = lower_case_campaign_name
                .toLowerCase()
                .replace(/\s+/g, '_');

              tracker_ref_name =
                tracker_ref_name + '_' + lower_case_campaign_name;
              const data = {
                user_id,
                agency_id,
                assigned_tracker_ref_name: tracker_ref_name,
                campaign_name: tracker_ref_name,
                campaign_name_label: campaign_name,
                contact_ids: contacts,
                selected_line_channel,
                api_token,
                api_secret,
                campaign_type,
                templates,
                automations,
                proposal: proposal_template_id,
                campaign_notification_additional_recipients,
              };
              payload.data = data;
              await c.campaignSchedule.create(
                {
                  agency_fk: agency_id,
                  campaign_name: campaign_name,
                  recipient_count: contacts.length,
                  slack_notification: 'reminder',
                  campaign_source: '1 hour',
                  send_date: oneHourBefore,
                  time_zone: timeZone,
                  platform: 'line',
                  status: 1,
                  triggered: 0,
                },
                { campaign_schedule_trasanction },
              );

              await c.campaignSchedule.create(
                {
                  agency_fk: agency_id,

                  tracker_ref_name: tracker_ref_name,
                  campaign_name: campaign_name,
                  recipient_count: contacts.length,
                  slack_notification: 'campaign',
                  campaign_source: JSON.stringify(payload),
                  send_date: campaignSchedule,
                  time_zone: timeZone,
                  platform: 'line',
                  status: 1,
                  triggered: 0,
                },
                { campaign_schedule_trasanction },
              );
            }
            await campaign_schedule_trasanction.commit();
            h.api.createResponse(
              request,
              response,
              200,
              {},
              'campaign-schedule-1699538580-creation-success',
              { portal },
            );
          } catch (campaign_schedul_trasanction_err) {
            Sentry.captureException(campaign_schedul_trasanction_err);
            console.log(campaign_schedul_trasanction_err);
            await campaign_schedule_trasanction.rollback();
            h.api.createResponse(
              request,
              response,
              500,
              { campaign_schedul_trasanction_err },
              'campaign-schedule-1699538580-creation-failed',
              {
                portal,
              },
            );
          }
        }
        if (!h.isEmpty(campaign_draft_id)) {
          await c.campaignDraft.update(
            campaign_draft_id,
            {
              status: 'processed',
            },
            user_id,
          );
        }
      }
    },
  });

  next();
};

/**
 * Description
 * Function to get current subscription of an agency
 * @async
 * @function
 * @name getCurrentSubscription
 * @kind function
 * @param {any} request
 * @returns {Promise<{ agency_id: any; subscription: any; is_legacy: boolean, }>}
 * current subscription details and agency ID
 */
async function getCurrentSubscription(request) {
  const legacy_agencies = process.env.LEGACY_AGENCIES.split(',');
  const { user_id } = h.user.getCurrentUser(request);

  const currentAgencyUser = await c.agencyUser.findOne({
    user_fk: user_id,
  });

  const agency_id = currentAgencyUser?.agency_fk;
  const is_legacy = legacy_agencies.includes(agency_id);
  // get agency active subscription
  const subscription = await c.agencySubscription.findOne(
    {
      agency_fk: agency_id,
      status: 'active',
    },
    { order: [['created_date', 'DESC']] },
  );

  return { agency_id, subscription, is_legacy };
}
