const Sentry = require('@sentry/node');
const { Op } = require('sequelize');
const constant = require('../../../constants/constant.json');
const c = require('../../../controllers');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');
const models = require('../../../models');
const userRoleController =
  require('../../../controllers/userRole').makeUserRoleController(models);
const fs = require('fs');
const { promisify } = require('util');

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'GET',
    url: '/staff/whatsapp-message-tracker',
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    schema: {
      query: {
        agency_id: { type: 'string' },
        tracker_ref_name: { type: 'string' },
        quick_reply: { type: 'string' },
        only_with_response: { type: 'boolean' },
        agency_user_id: { type: 'string' },
      },
    },
    handler: async (req, res) => {
      let {
        tracker_ref_name,
        quick_reply,
        agency_id,
        agency_user_id,
        only_with_response,
      } = req.query;

      const { user_id } = h.user.getCurrentUser(req);

      let whatsappChatInclude = [
        {
          model: models.contact,
        },
      ];

      const messageTracker = await c.whatsappMessageTracker.findOne(
        {
          agency_fk: agency_id,
          tracker_ref_name,
          tracker_type: 'main',
        },
        { order: [['created_date', 'DESC']] },
      );

      const campaign_name = messageTracker?.dataValues?.campaign_name;

      const userRoleRecord = await userRoleController.findOne({
        user_fk: user_id,
      });

      const isAgencySalesUser =
        userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES;

      const where = {
        campaign_name,
        tracker_ref_name,
      };

      let receiver_numbers = null;

      if (isAgencySalesUser) {
        const agencyUser = await c.agencyUser.findOne({ user_fk: user_id });

        whatsappChatInclude = [
          {
            model: models.contact,
            where: {
              agency_user_fk: agencyUser.agency_user_id,
            },
            required: true,
          },
        ];

        const whatsappMessage = await c.whatsappChat.findAll(
          {},
          { include: whatsappChatInclude },
        );

        const whatsappRecieverNumbers = whatsappMessage.map((msg) => {
          msg = msg && msg.toJSON ? msg.toJSON() : msg;
          return msg.receiver_number;
        });

        receiver_numbers = whatsappRecieverNumbers;
      }

      if (!isAgencySalesUser && h.general.notEmpty(agency_user_id)) {
        const listOfAgencyUsers = agency_user_id.split(',');
        whatsappChatInclude = [
          {
            model: models.contact,
            where: {
              agency_user_fk: {
                [Op.in]: listOfAgencyUsers,
              },
            },
            required: true,
          },
        ];

        const whatsappMessage = await c.whatsappChat.findAll(
          {
            campaign_name,
          },
          { include: whatsappChatInclude },
        );

        const whatsappRecieverNumbers = whatsappMessage.map((msg) => {
          msg = msg && msg.toJSON ? msg.toJSON() : msg;
          return msg.receiver_number;
        });

        receiver_numbers = whatsappRecieverNumbers;
      }

      if (
        h.general.notEmpty(only_with_response) &&
        h.general.cmpBool(only_with_response, true)
      ) {
        where.replied = only_with_response;
      }

      if (h.general.notEmpty(quick_reply)) {
        quick_reply = quick_reply.split('|');
        const msg_body_filter = quick_reply.map((qr) => {
          return {
            msg_body: qr,
          };
          // return {
          //   msg_body: { [Op.like]: `%${qr}%` },
          // };
        });

        const orFilter = [
          {
            msg_body: {
              [Op.or]: msg_body_filter,
            },
          },
        ];

        if (quick_reply.filter((q) => q === 'manual_reply').length > 0) {
          msg_body_filter.push({
            msg_type: 'text',
          });
        }

        const whatsapp_chat_filter = {
          // agency_fk: agency_id,
          [Op.or]: msg_body_filter,
        };

        const whatsappMessage = await c.whatsappChat.findAll(
          whatsapp_chat_filter,
          { include: whatsappChatInclude },
        );

        const whatsappRecieverNumbers = whatsappMessage.map((msg) => {
          msg = msg && msg.toJSON ? msg.toJSON() : msg;
          return msg.receiver_number;
        });

        // where.receiver_number = {
        //   [Op.in]: whatsappRecieverNumbers,
        // };

        if (receiver_numbers && Array.isArray(receiver_numbers)) {
          receiver_numbers = whatsappRecieverNumbers.filter((num) => {
            return receiver_numbers.includes(num);
          });
        } else {
          receiver_numbers = whatsappRecieverNumbers;
        }
      }

      if (receiver_numbers && Array.isArray(receiver_numbers)) {
        where.receiver_number = {
          [Op.in]: receiver_numbers,
        };
      }

      const include = [
        { model: models.agency },
        { model: models.agency_user, include: models.user },
        {
          model: models.contact,
          include: [
            { model: models.agency_user, include: [{ model: models.user }] },
          ],
        },
      ];
      const order = [['created_date', 'DESC']];

      try {
        const results = await c.whatsappMessageTracker.findAll(where, {
          order,
          include,
        });
        h.api.createResponse(
          req,
          res,
          200,
          { results: results },
          '1-agency-1622176002',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'GET',
          url: '/v1/staff/whatsapp-message-tracker',
        });
        h.api.createResponse(req, res, 500, {}, '2-agency-1622176015', {
          portal,
        });
      }
    },
  });
  fastify.route({
    method: 'GET',
    url: '/staff/whatsapp-message-tracker-aggregated',
    schema: {
      qs: {
        type: 'object',
        properties: {
          agency_id: { type: 'string' },
          tracker_ref_name: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      try {
        const {
          agency_id,
          tracker_ref_name,
          from,
          to,
          includeHiddenCampaigns,
        } = req.query;
        console.log(includeHiddenCampaigns);
        const where = {};
        if (agency_id) where.agency_fk = agency_id;
        if (tracker_ref_name) where.tracker_ref_name = tracker_ref_name;
        if (from && to) {
          const startDate = new Date(from);
          const endDate = new Date(to);
          where.broadcast_date = { [Op.between]: [startDate, endDate] };
        }
        where.tracker_type = 'main';
        if (h.cmpStr(includeHiddenCampaigns, 'false')) {
          where.visible = 1;
        }
        const results = await c.whatsappMessageTracker.getAggregatedRecords(
          where,
          { order: [['created_date', 'DESC']] },
        );
        const preview = results.reduce(
          (pv, cv) => {
            pv.pending += Number(cv.total_pending) || 0;
            pv.sent += Number(cv.total_sent) || 0;
            pv.delivered +=
              Number(cv.total_sent) - Number(cv.total_failed) || 0;
            pv.read += Number(cv.total_read) || 0;
            pv.replied += Number(cv.total_replied) || 0;
            pv.failed += Number(cv.total_failed) || 0;
            return pv;
          },
          {
            pending: 0,
            sent: 0,
            delivered: 0,
            failed: 0,
            read: 0,
            replied: 0,
          },
        );
        h.api.createResponse(
          req,
          res,
          200,
          { results: results || [], preview },
          '1-agency-1622176002',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'GET',
          url: '/v1/staff/whatsapp-message-tracker-aggregated',
        });
        h.api.createResponse(req, res, 500, {}, '2-agency-1622176015', {
          portal,
        });
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/whatsapp-message-tracker/:tracker_ref_name',
    schema: {
      params: {
        tracker_ref_name: { type: 'string' },
      },
      body: {
        type: 'object',
        required: ['campaign_label_name'],
        properties: {
          campaign_label_name: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
    },
    handler: async (req, res) => {
      try {
        const { campaign_label_name } = req.body;
        const { tracker_ref_name } = req.params;

        const update_tracker_transaction = await models.sequelize.transaction();

        await models.whatsapp_message_tracker.update(
          {
            campaign_name_label: campaign_label_name,
          },
          {
            where: {
              tracker_ref_name,
            },
            update_tracker_transaction,
          },
        );
        await update_tracker_transaction.commit();

        h.api.createResponse(
          req,
          res,
          200,
          {},
          '1-whatsapp-campaign-name-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${req.url}: user failed to create agency`, { err });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-campaign-name-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/whatsapp-message-tracker/hide-campaign
   * @apiName HideCampaign
   * @apiVersion 1.0.0
   * @apiGroup WhatsAppMessageTracker
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} [tracker_ref_name] Tracker Ref Name
   */

  fastify.route({
    method: 'POST',
    url: '/staff/whatsapp-message-tracker/hide-campaign',
    schema: {
      body: {
        type: 'object',
        required: ['tracker_ref_name'],
        properties: {
          tracker_ref_name: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message_code: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
      await userMiddleware.hasAdminAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      const portal = h.request.getPortal(request);

      try {
        // tracker ref name
        const { tracker_ref_name } = request.body;

        // hide campaign by tracker ref name
        await models.whatsapp_message_tracker.update(
          {
            visible: 0,
          },
          {
            where: {
              tracker_ref_name: tracker_ref_name,
            },
          },
        );

        h.api.createResponse(
          request,
          reply,
          200,
          {},
          '1-hide-campaign-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to hide selected campaign`, err);
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-hide-campaign-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/whatsapp-message-tracker/show-hidden-campaign
   * @apiName ShowHiddenCampaign
   * @apiVersion 1.0.0
   * @apiGroup WhatsAppMessageTracker
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   * @apiParam {string} [agency_id] Agency ID
   */

  fastify.route({
    method: 'POST',
    url: '/staff/whatsapp-message-tracker/show-hidden-campaign',
    schema: {
      body: {
        type: 'object',
        required: ['agency_id'],
        properties: {
          agency_id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message_code: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
      await userMiddleware.hasAdminAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      const portal = h.request.getPortal(request);

      try {
        // agency_id
        const { agency_id } = request.body;

        // hide campaign by tracker ref name
        await models.whatsapp_message_tracker.update(
          {
            visible: 1,
          },
          {
            where: {
              agency_fk: agency_id,
              visible: 0,
            },
          },
        );

        h.api.createResponse(
          request,
          reply,
          200,
          {},
          '1-resend-invite-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${request.url}: failed to reshow hidden selected campaign`,
          { err },
        );
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-resend-invite-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/whatsapp-message-tracker/download-campaign-reports/:tracker_ref_name Generate and download campaign report
   * @apiName StaffWhatsAppMessageTrackerDownloadCampaignReport
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
    url: '/staff/whatsapp-message-tracker/download-campaign-reports/:tracker_ref_name',
    schema: {
      params: {
        tracker_ref_name: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      try {
        const { tracker_ref_name } = req.params;
        const [campaignCTARecord, messageTrackerEntry] = await Promise.all([
          models.campaign_cta.findOne({
            where: {
              campaign_tracker_ref_name: tracker_ref_name,
            },
          }),
          models.whatsapp_message_tracker.findOne({
            where: {
              tracker_type: 'main',
              tracker_ref_name: tracker_ref_name,
            },
            order: [['created_date', 'ASC']],
          }),
        ]);

        const trackerRecord = await models.whatsapp_message_tracker.findAll({
          where: {
            tracker_type: 'main',
            tracker_ref_name: tracker_ref_name,
            campaign_name: messageTrackerEntry?.campaign_name,
            agency_fk: messageTrackerEntry?.agency_fk,
          },
          include: [
            {
              model: models.contact,
              required: true,
              include: [
                {
                  model: models.agency_user,
                  include: [
                    {
                      model: models.user,
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
          order: [['created_date', 'ASC']],
        });

        const manual_contact_ids = [];
        const tracker_report = [];

        for (const tracker of trackerRecord) {
          const [
            cta1,
            cta1_landing,
            cta2,
            cta3,
            cta4,
            cta5,
            cta6,
            cta7,
            cta8,
            cta9,
            cta10,
            with_manual_replies,
          ] = await Promise.all([
            !h.isEmpty(campaignCTARecord?.cta_1)
              ? models.whatsapp_chat.findOne({
                  where: {
                    contact_fk: tracker?.contact_fk,
                    campaign_name: tracker?.campaign_name,
                    msg_body: campaignCTARecord?.cta_1,
                    msg_type: 'button',
                    created_date: { [Op.gt]: tracker?.broadcast_date },
                    original_event_id: { [Op.ne]: 'web_app_event' },
                  },
                })
              : null,
            !h.isEmpty(campaignCTARecord?.cta_1)
              ? models.whatsapp_chat.findOne({
                  where: {
                    contact_fk: tracker?.contact_fk,
                    campaign_name: tracker?.campaign_name,
                    msg_body: campaignCTARecord?.cta_1,
                    created_date: { [Op.gt]: tracker?.broadcast_date },
                    original_event_id: 'web_app_event',
                  },
                })
              : null,
            !h.isEmpty(campaignCTARecord?.cta_2)
              ? models.whatsapp_chat.findOne({
                  where: {
                    contact_fk: tracker?.contact_fk,
                    campaign_name: tracker?.campaign_name,
                    msg_body: campaignCTARecord?.cta_2,
                    msg_type: 'button',
                    created_date: { [Op.gt]: tracker?.broadcast_date },
                  },
                })
              : null,
            !h.isEmpty(campaignCTARecord?.cta_3)
              ? models.whatsapp_chat.findOne({
                  where: {
                    contact_fk: tracker?.contact_fk,
                    campaign_name: tracker?.campaign_name,
                    msg_body: campaignCTARecord?.cta_3,
                    msg_type: 'button',
                    created_date: { [Op.gt]: tracker?.broadcast_date },
                  },
                })
              : null,
            !h.isEmpty(campaignCTARecord?.cta_4)
              ? models.whatsapp_chat.findOne({
                  where: {
                    contact_fk: tracker?.contact_fk,
                    campaign_name: tracker?.campaign_name,
                    msg_body: campaignCTARecord?.cta_4,
                    msg_type: 'button',
                    created_date: { [Op.gt]: tracker?.broadcast_date },
                  },
                })
              : null,
            !h.isEmpty(campaignCTARecord?.cta_5)
              ? models.whatsapp_chat.findOne({
                  where: {
                    contact_fk: tracker?.contact_fk,
                    campaign_name: tracker?.campaign_name,
                    msg_body: campaignCTARecord?.cta_5,
                    msg_type: 'button',
                    created_date: { [Op.gt]: tracker?.broadcast_date },
                  },
                })
              : null,
            !h.isEmpty(campaignCTARecord?.cta_6)
              ? models.whatsapp_chat.findOne({
                  where: {
                    contact_fk: tracker?.contact_fk,
                    campaign_name: tracker?.campaign_name,
                    msg_body: campaignCTARecord?.cta_6,
                    msg_type: 'button',
                    created_date: { [Op.gt]: tracker?.broadcast_date },
                  },
                })
              : null,
            !h.isEmpty(campaignCTARecord?.cta_7)
              ? models.whatsapp_chat.findOne({
                  where: {
                    contact_fk: tracker?.contact_fk,
                    campaign_name: tracker?.campaign_name,
                    msg_body: campaignCTARecord?.cta_7,
                    msg_type: 'button',
                    created_date: { [Op.gt]: tracker?.broadcast_date },
                  },
                })
              : null,
            !h.isEmpty(campaignCTARecord?.cta_8)
              ? models.whatsapp_chat.findOne({
                  where: {
                    contact_fk: tracker?.contact_fk,
                    campaign_name: tracker?.campaign_name,
                    msg_body: campaignCTARecord?.cta_8,
                    msg_type: 'button',
                    created_date: { [Op.gt]: tracker?.broadcast_date },
                  },
                })
              : null,
            !h.isEmpty(campaignCTARecord?.cta_9)
              ? models.whatsapp_chat.findOne({
                  where: {
                    contact_fk: tracker?.contact_fk,
                    campaign_name: tracker?.campaign_name,
                    msg_body: campaignCTARecord?.cta_9,
                    msg_type: 'button',
                    created_date: { [Op.gt]: tracker?.broadcast_date },
                  },
                })
              : null,
            !h.isEmpty(campaignCTARecord?.cta_10)
              ? models.whatsapp_chat.findOne({
                  where: {
                    contact_fk: tracker?.contact_fk,
                    campaign_name: tracker?.campaign_name,
                    msg_body: campaignCTARecord?.cta_10,
                    msg_type: 'button',
                    created_date: { [Op.gt]: tracker?.broadcast_date },
                  },
                })
              : null,
            models.whatsapp_chat.findOne({
              where: {
                contact_fk: tracker?.contact_fk,
                campaign_name: tracker?.campaign_name,
                msg_type: 'text',
                created_date: { [Op.gt]: tracker?.broadcast_date },
              },
            }),
          ]);

          tracker_report.push([
            tracker?.contact_fk,
            tracker?.contact?.first_name + ' ' + tracker?.contact?.last_name,
            tracker?.contact?.lead_score,
            tracker?.contact?.mobile_number,
            tracker?.contact?.agency_user?.user.first_name +
              ' ' +
              tracker?.contact?.agency_user?.user.last_name,
            tracker?.campaign_name_label,
            tracker?.failed ? 'No' : 'Yes',
            cta1 ? 'Yes' : 'No',
            cta1_landing ? 'Yes' : 'No',
            cta2 ? 'Yes' : 'No',
            cta3 ? 'Yes' : 'No',
            cta4 ? 'Yes' : 'No',
            cta5 ? 'Yes' : 'No',
            cta6 ? 'Yes' : 'No',
            cta7 ? 'Yes' : 'No',
            cta8 ? 'Yes' : 'No',
            cta9 ? 'Yes' : 'No',
            cta10 ? 'Yes' : 'No',
            with_manual_replies ? 'Yes' : 'No',
          ]);

          if (with_manual_replies) {
            manual_contact_ids.push(with_manual_replies?.contact_fk);
          }
        }

        const report_headers = [
          'Contact ID',
          'Contact Name',
          'Engagement Score',
          'Mobile Number',
          'Lead Owner',
          'Project Marketed',
          'Message Sent',
          'CTA 1',
          'Landing CTA 1',
          'CTA 2',
          'CTA 3',
          'CTA 4',
          'CTA 5',
          'With Manual Reply',
        ];

        const writeFileAsync = promisify(fs.writeFile);
        const campaign_name_label = messageTrackerEntry?.campaign_name_label
          ? messageTrackerEntry?.campaign_name_label
          : messageTrackerEntry?.campaign_name;
        const reportFilename = `${campaign_name_label} Report.csv`;

        const reportData = [report_headers.join(',')]
          .concat(tracker_report.map((report) => report.join(',')))
          .join('\n');

        await writeFileAsync(reportFilename, reportData);
        const readFileAsync = promisify(fs.readFile);

        const fileContents = await readFileAsync(reportFilename);
        res
          .header(
            'Content-Disposition',
            `attachment; filename="${reportFilename}"`,
          )
          .header('Content-Type', 'text/csv')
          .send(Buffer.from(fileContents, 'binary'));
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-campaign-dowload-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/whatsapp-message-tracker/download-campaign-manual-reports/:tracker_ref_name Generate and download campaign manual reply report
   * @apiName StaffWhatsAppMessageTrackerDownloadCampaignManualReport
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
    url: '/staff/whatsapp-message-tracker/download-campaign-manual-reports/:tracker_ref_name',
    schema: {
      params: {
        tracker_ref_name: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      try {
        const { tracker_ref_name } = req.params;

        const messageTrackerEntry =
          await models.whatsapp_message_tracker.findOne({
            where: {
              tracker_type: 'main',
              tracker_ref_name: tracker_ref_name,
            },
            order: [['created_date', 'ASC']],
          });
        const trackerRecord = await models.whatsapp_message_tracker.findAll({
          where: {
            tracker_type: 'main',
            agency_fk: messageTrackerEntry?.agency_fk,
            campaign_name: messageTrackerEntry?.campaign_name,
          },
          include: [
            {
              model: models.whatsapp_chat,
              where: {
                msg_type: 'text',
              },
            },
          ],
          order: [['created_date', 'ASC']],
        });

        const processedNumbers = [];
        const manualReplies = [];

        for (const tracker of trackerRecord) {
          const trackerData = tracker?.dataValues;
          if (!processedNumbers.includes(trackerData?.receiver_number)) {
            processedNumbers.push(trackerData?.receiver_number);
            const chatRecord = await models.whatsapp_chat.findAll({
              where: {
                msg_type: 'text',
                agency_fk: messageTrackerEntry?.agency_fk,
                campaign_name: messageTrackerEntry?.campaign_name,
                receiver_number: trackerData?.receiver_number,
              },
              include: [
                {
                  model: models.contact,
                  required: true,
                },
              ],
              order: [['created_date', 'ASC']],
            });

            for (let i = 0; i < chatRecord.length; i++) {
              const chat = chatRecord[i].dataValues;
              const nextChat = chatRecord[i + 1]?.dataValues;

              let message = chat?.msg_body;
              message = message.replace(/[\n\r]/g, '');
              const mesage_date = new Date(chat?.created_date);
              const options = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              };
              const formattedMsgDate = mesage_date.toLocaleString(
                'en-US',
                options,
              );
              let record = [
                chat?.contact?.dataValues?.contact_id,
                chat?.contact?.dataValues?.first_name,
                chat?.contact?.dataValues?.last_name,
                chat?.contact?.dataValues?.mobile_number,
                message,
                formattedMsgDate,
              ];

              const replyRecord = await models.whatsapp_chat.findAll({
                where: {
                  msg_type: 'frompave',
                  agency_fk: messageTrackerEntry?.agency_fk,
                  campaign_name: messageTrackerEntry?.campaign_name,
                  created_date: {
                    [Op.gt]: chat?.created_date,
                    ...(nextChat &&
                    h.cmpStr(nextChat?.receiver_number, chat?.receiver_number)
                      ? { [Op.lt]: nextChat?.created_date }
                      : {}),
                  },
                  receiver_number: chat?.receiver_number,
                },
                order: [['created_date', 'ASC']],
              });

              for (const reply of replyRecord) {
                const replyData = reply?.dataValues;
                let reply_message = replyData?.msg_body;
                reply_message = reply_message.replace(/[\n\r]/g, '');
                const reply_date = new Date(replyData?.created_date);
                const options = {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                };
                const formattedReplyDate = reply_date.toLocaleString(
                  'en-US',
                  options,
                );
                const interval = await h.getDateTimeInterval(
                  chat?.created_date,
                  replyData?.created_date,
                );
                record = [
                  chat?.contact?.dataValues?.contact_id,
                  chat?.contact?.dataValues?.first_name,
                  chat?.contact?.dataValues?.last_name,
                  chat?.contact?.dataValues?.mobile_number,
                  message,
                  formattedMsgDate,
                  reply_message,
                  formattedReplyDate,
                  interval,
                ];
              }
              manualReplies.push(record);
            }
          }
        }

        const report_headers = [
          'Contact ID',
          'First Name',
          'Last Name',
          'Contact Number',
          'Message',
          'Message Date',
          'Agent Reply',
          'Reply Date',
          'Response Duration',
        ];

        const writeFileAsync = promisify(fs.writeFile);
        const campaign_name_label = messageTrackerEntry?.campaign_name_label
          ? messageTrackerEntry?.campaign_name_label
          : messageTrackerEntry?.campaign_name;
        const reportFilename = `${campaign_name_label} Manual Replies Report.csv`;

        const reportData = [report_headers.join('|')]
          .concat(manualReplies.map((report) => report.join('|')))
          .join('\n');

        await writeFileAsync(reportFilename, reportData);
        const readFileAsync = promisify(fs.readFile);

        const fileContents = await readFileAsync(reportFilename);
        res
          .header(
            'Content-Disposition',
            `attachment; filename="${reportFilename}"`,
          )
          .header('Content-Type', 'text/csv')
          .send(Buffer.from(fileContents, 'binary'));
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-campaign-dowload-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /** Get campaign tracker recipients */
  fastify.route({
    method: 'GET',
    url: '/staff/whatsapp-message-tracker/recipients/:agency_id/:tracker_ref_name',
    schema: {
      params: {
        agency_id: { type: 'string' },
        tracker_ref_name: { type: 'string' },
      },
    },
    handler: async (request, reply) => {
      const { agency_id, tracker_ref_name } = request.params;
      const {
        search,
        searchStatus,
        from,
        to,
        pageIndex,
        pageSize,
        sortColumn,
        sortOrder,
        totalCount,
      } = request.query;
      const limit = pageSize ? parseInt(pageSize) : undefined;
      const offset = pageIndex * limit;
      try {
        const order = [['created_date', 'DESC']];

        if (sortColumn && sortOrder) {
          const split = sortColumn.split('.');
          for (let i = 0; i < split.length; i++) {
            if (i !== split.length - 1) split[i] = models[split[i]];
          }
          order.unshift([...split, sortOrder]);
        }

        const recipients =
          await c.whatsappMessageTracker.getCampaignWhatsAppRecipients(
            agency_id,
            tracker_ref_name,
            limit,
            offset,
            order,
            search,
            searchStatus,
            from,
            to,
            totalCount,
          );
        const list = recipients.records;
        const totalTrackerCount = recipients.totalTrackerCount;

        const metadata = {
          pageCount: pageSize
            ? Math.ceil(totalTrackerCount / limit)
            : undefined,
          pageIndex: pageIndex ? parseInt(pageIndex) : undefined,
          totalCount: totalTrackerCount,
        };

        h.api.createResponse(
          request,
          reply,
          200,
          { list, metadata },
          'automation-history-recipients-1689818819-success',
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          'automation-history-recipients-1689818819-failed',
        );
      }
    },
  });
  next();
};
