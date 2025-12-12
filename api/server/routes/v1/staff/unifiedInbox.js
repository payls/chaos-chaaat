const Sentry = require('@sentry/node');
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const constant = require('../../../constants/constant.json');
const c = require('../../../controllers');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');
const models = require('../../../models');
const userRoleController =
  require('../../../controllers/userRole').makeUserRoleController(models);
const fs = require('fs');
const config = require('../../../configs/config')(process.env.NODE_ENV);
const Pusher = require('pusher');

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'GET',
    url: '/staff/unified-inbox',
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    schema: {
      query: {
        agency_id: { type: 'string' },
        msg_platform: { type: 'string' },
        agency_user_id: { type: 'string' },
        limit: { type: 'integer' },
        offset: { type: 'integer' },
        searchQuery: { type: 'string' },
        sortBy: { type: 'string' },
        only_with_response: { type: 'boolean' },
        only_automation: { type: 'boolean' },
      },
    },
    handler: async (req, res) => {
      const { user_id } = h.user.getCurrentUser(req);
      const {
        agency_id,
        agency_user_id,
        msg_platform,
        limit = 50,
        offset = 0,
        searchQuery = '',
        sortBy,
        only_with_response,
        only_automation,
      } = req.query;

      const sorting = sortBy === 'oldest' ? 'ASC' : 'DESC';
      const listOfAgencyUsers = agency_user_id?.split(',') ?? [];
      const searchString = searchQuery.trim();

      try {
        // where clause for contact fetching
        const contactWhere = {
          status: {
            [Op.not]: 'archived',
          },
          [Op.or]: [
            Sequelize.where(
              Sequelize.fn(
                'CONCAT',
                Sequelize.col('contact.first_name'),
                ' ',
                Sequelize.col('contact.last_name'),
              ),
              {
                [Op.like]: `%${searchString}%`,
              },
            ),
            { mobile_number: { [Op.like]: `%${searchString}%` } },
            { email: { [Op.like]: `%${searchString}%` } },
          ],
        };
        // getting the current agency user and user role
        const [userRoleRecord, currentAgencyUser] = await Promise.all([
          userRoleController.findOne({
            user_fk: user_id,
          }),
          c.agencyUser.findOne({
            user_fk: user_id,
          }),
        ]);

        // checking if needed to limit result for agency sales user
        const isAgencySalesUser =
          userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES;
        if (isAgencySalesUser) {
          contactWhere.agency_user_fk = currentAgencyUser.agency_user_id;
        }
        if (!isAgencySalesUser && h.general.notEmpty(agency_user_id)) {
          contactWhere.agency_user_fk = {
            [Op.in]: listOfAgencyUsers,
          };
        }

        // include for unified inbox
        const include = [
          {
            model: models.contact,
            where: contactWhere,
            include: [
              {
                model: models.agency_user,
                include: [{ model: models.user }],
              },
            ],
          },
          { model: models.agency_user, include: [{ model: models.user }] },
        ];
        // where for unified inbox
        const where = {
          agency_fk: agency_id,
          tracker_type: 'main',
          sender: {
            [Op.ne]: null,
          },
          receiver: {
            [Op.ne]: null,
          },
        };

        if (only_automation === true) {
          where.tracker_ref_name = { [Op.like]: `%_automation_%` };
        }

        if (only_with_response === true) {
          where.msg_type = {
            [Op.in]: [
              'text',
              'image',
              'video',
              'file',
              'document',
              'button',
              'audio',
              'audio_file',
            ],
          };
        }

        if (msg_platform) {
          const listOfPlatforms = msg_platform.split(',');
          where.msg_platform = {
            [Op.in]: listOfPlatforms,
          };
        } else {
          where.msg_platform = null;
        }

        // get unified inbox data based on conditions
        const unifiedInbox = await c.unifiedInbox.findAll(where, {
          include,
          group: [
            'unified_inbox.agency_fk',
            'unified_inbox.contact_fk',
            'unified_inbox.msg_platform',
          ],
          order: [['last_msg_date', sorting]],
          limit,
          offset,
        });

        const platformList = ['whatsapp', 'livechat', 'line', 'fbmessenger'];
        const unsupportedMedia = ['audio', 'location', 'contact'];

        // update the unified inbox data to include the read status and latest IDs
        const updatedInbox = await Promise.all(
          unifiedInbox.map(async (msg) => {
            if (!platformList.includes(msg.dataValues.msg_platform)) return msg;

            let readCount = 0;
            if (msg.dataValues.msg_id) {
              readCount = await models.agency_user_chat_read_status.count({
                where: {
                  chat_id: msg.dataValues.msg_id,
                  chat_type: msg.dataValues.msg_platform,
                  agency_user_fk: currentAgencyUser?.agency_user_id,
                },
                order: [['created_date', 'DESC']],
                limit: 1,
              });
            }

            const isRead =
              [
                'frompave',
                'img_frompave',
                'file_frompave',
                'video_frompave',
                'audio_frompave',
              ].includes(msg.dataValues.msg_type) || readCount > 0;

            const msgTypes = {
              image: 'Photo',
              img_frompave: 'Photo',
              video: 'Video',
              video_frompave: 'Video',
              audio: 'Audio',
              audio_file: 'Audio',
              audio_frompave: 'Audio',
              document: 'Document',
              file: 'Document',
              file_frompave: 'Document',
            };

            // Mutating the `dataValues` directly to ensure agency_user_read is present
            msg.dataValues.agency_user_read = isRead;
            msg.dataValues.latest_msg_id = msg.dataValues.msg_id;
            msg.dataValues.msg_body =
              msgTypes[msg.dataValues.msg_type] ||
              (unsupportedMedia.includes(msg.dataValues.msg_type)
                ? 'Unsupported Media'
                : msg.dataValues.msg_body);
            msg.dataValues.last_msg_type = msg.dataValues.msg_type;

            return msg;
          }),
        );

        h.api.createResponse(
          req,
          res,
          200,
          { results: updatedInbox },
          '1-inbox-1622176002',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'GET',
          url: '/v1/staff/unified-inbox',
        });
        h.api.createResponse(req, res, 500, {}, '2-inbox-1622176015', {
          portal,
        });
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/unified-inbox',

    handler: async (req, res) => {
      const { agentId, contactId, agentUserId } = req.body;
      console.log(req.params);
      const pusher = new Pusher({
        ...config.pusher,
        cluster: 'ap1',
        useTLS: true,
      });

      pusher.trigger(
        `message_thread_channel_${agentId}_${contactId}`,
        'receive-new-chat',
        {
          message: {
            created_date_seconds: 5000,
            created_date_time_ago: 'a month ago',
            updated_date_seconds: 5000,
            updated_date_time_ago: 'a month ago',
            whatsapp_chat_id: '743ed0c3-250a-4f58-8fdd-cae301b5a5e0',
            agency_fk: '08012e63-a6ce-4cb1-abdf-89b592955729',
            agency_user_fk: null,
            contact_fk: '43330e2a-a048-4e0b-8aa2-d0ad3d765fc3',
            original_event_id:
              'wamid.HBgKNjU5ODUwODA1MBUCABIYFjNFQjA5QjEzNTc5MzUzNTU0MjAwNTIA',
            msg_id: null,
            msg_type: 'text',
            msg_body: 'Hi from backend',
            msg_timestamp: 1688537686,
            sender_number: '85268793050',
            sender_url: 'whatsappcloud://85268793050@',
            receiver_number: '6598508050',
            receiver_url: 'whatsappcloud://6598508050@whatsapp.com?name=Ashley',
            delivered: 1,
            sent: 1,
            failed: 0,
            read: 1,
            campaign_name:
              '1688537688723 Pave 43330e2a-a048-4e0b-8aa2-d0ad3d765fc3',
            msg_origin: 'campaign',
            created_by: null,
            created_date: '05 Jul 2023 06:14 am',
            updated_by: null,
            updated_date: '05 Jul 2023 06:14 am',
            created_date_raw: '2023-07-05T06:14:48.000Z',
            updated_date_raw: '2023-07-05T06:14:48.000Z',
          },
        },
      );

      pusher.trigger(
        `message_list_channel_${agentId}_${agentUserId}`,
        // `message_list_channel_08012e63-a6ce-4cb1-abdf-89b592955729_733ec238-0cd6-4e8a-8176-14d923fce7fd`,
        'receive-new-message',
        {
          message: {
            created_date_seconds: 19000,
            created_date_time_ago: '12 days ago',
            updated_date_seconds: 19000,
            updated_date_time_ago: '12 days ago',
            unified_inbox_id: '03cd7357-5ecd-4dc2-8004-51dac705643e',
            tracker_id: 'a440b6ca-3165-4aef-addc-2b7599d40025',
            tracker_ref_name: '1688537688723_user_message_pave',
            campaign_name:
              '1688537688723 Pave 43330e2a-a048-4e0b-8aa2-d0ad3d765fc3',
            agency_fk: '08012e63-a6ce-4cb1-abdf-89b592955729',
            contact_fk: '43330e2a-a048-4e0b-8aa2-d0ad3d765fc3',
            agency_user_fk: null,
            event_id:
              'wamid.HBgKNjU5ODUwODA1MBUCABIYFjNFQjA5QjEzNTc5MzUzNTU0MjAwNTIA',
            msg_platform: 'whatsapp',
            sender: '85268793050',
            sender_url: 'whatsappcloud://85268793050@',
            receiver: '6598508050',
            receiver_url: 'whatsappcloud://6598508050@whatsapp.com?name=Ashley',
            msg_body:
              'was alot of trial and error i am actually not even sure how i got the code to come in',
            msg_type: 'text',
            batch_count: 1,
            template_count: 1,
            tracker_type: 'main',
            pending: false,
            sent: 1,
            delivered: 1,
            failed: 0,
            read: 1,
            replied: 1,
            broadcast_date: '05 Jul 2023 02:14 pm',
            last_msg_date: '19 Jul 2023 01:52 am',
            visible: 1,
            created_by: null,
            created_date: '19 Jul 2023 09:52 am',
            updated_by: null,
            updated_date: '19 Jul 2023 09:52 am',
            agency_user: null,
            contact: {
              created_date_seconds: 5000,
              created_date_time_ago: 'a month ago',
              updated_date_seconds: 8000,
              updated_date_time_ago: '23 days ago',
              contact_id: '43330e2a-a048-4e0b-8aa2-d0ad3d765fc3',
              first_name: 'Ashley',
              last_name: 'Yap',
              email: 'ashley@focusmovement.sg',
              mobile_number: '+6598508050',
              company: null,
              title: null,
              is_whatsapp: false,
              opt_out_whatsapp: false,
              opt_out_whatsapp_date: '',
              is_agency_sms_connection: false,
              opt_out_sms: false,
              lead_score: 0,
              last_24_hour_lead_score: 0,
              last_48_hour_lead_score: 0,
              last_24_hour_lead_score_diff: 0,
              lead_source: null,
              permalink: null,
              permalink_message: null,
              permalink_sent_date: '',
              permalink_last_opened: null,
              permalink_template: 'pave',
              priority: null,
              lead_status: 'no_proposal',
              buy_status: null,
              subscriber_status: null,
              manual_label: null,
              is_general_enquiry: false,
              profile_picture_url: null,
              agency_fk: '08012e63-a6ce-4cb1-abdf-89b592955729',
              agency_user_fk: 'fd97ef30-5092-44c2-960f-02e9956123e9',
              status: 'active',
              agent_email_preference: true,
              contact_email_preference: true,
              lead_status_last_update: '2023-07-05T06:14:48.000Z',
              enquiry_email_timestamp: null,
              from_export: null,
              has_appointment: null,
              appointment_date: '',
              created_by: null,
              created_date: '05 Jul 2023 06:14 am',
              updated_by: 'f5863ba7-f04a-421a-8b68-afb05b88f0ac',
              updated_date: '08 Jul 2023 04:20 am',
              agency_user: {
                created_date_seconds: 5000,
                created_date_time_ago: 'a month ago',
                updated_date_seconds: 5000,
                updated_date_time_ago: 'a month ago',
                agency_user_id: 'fd97ef30-5092-44c2-960f-02e9956123e9',
                user_fk: 'ea370f8e-dcec-41de-9985-7e1c1a43ff8a',
                agency_fk: '08012e63-a6ce-4cb1-abdf-89b592955729',
                title: null,
                description: null,
                year_started: null,
                website: null,
                instagram: null,
                linkedin: null,
                facebook: null,
                youtube: null,
                created_by: 'f5863ba7-f04a-421a-8b68-afb05b88f0ac',
                created_date: '05 Jul 2023 01:34 am',
                updated_by: 'f5863ba7-f04a-421a-8b68-afb05b88f0ac',
                updated_date: '05 Jul 2023 01:34 am',
                user: {
                  full_name: 'Sky Inudom',
                  profile_picture_url:
                    'https://cdn.yourpave.com/assets/profile_picture_placeholder.png',
                  created_date_seconds: 5000,
                  created_date_time_ago: 'a month ago',
                  updated_date_seconds: 20000,
                  updated_date_time_ago: '11 days ago',
                  user_id: 'ea370f8e-dcec-41de-9985-7e1c1a43ff8a',
                  password:
                    '7754b697b6aa5941b8c2eaf940d7585686d02bdf2e26ca7e00a6dc66e6bafce2b05b1e80c8c49f5e8c19e766b894430d75fa699bfc1b68ad96b3d2bc522b705b',
                  password_salt: '05ce7ddfdb2f2b9022b24812696adf',
                  first_name: 'Sky',
                  middle_name: null,
                  last_name: 'Inudom',
                  email: 'sky+pave@yourpave.com',
                  mobile_number: null,
                  is_whatsapp: false,
                  hubspot_bcc_id: null,
                  date_of_birth: null,
                  gender: null,
                  nationality: null,
                  ordinarily_resident_location: null,
                  permanent_resident: null,
                  buyer_type: '',
                  last_seen: '2023-07-20T03:27:32.000Z',
                  status: 'active',
                  created_by: 'ea370f8e-dcec-41de-9985-7e1c1a43ff8a',
                  created_date: '05 Jul 2023 01:34 am',
                  updated_by: 'f5863ba7-f04a-421a-8b68-afb05b88f0ac',
                  updated_date: '20 Jul 2023 03:27 am',
                  created_date_raw: '2023-07-05T01:34:11.000Z',
                  updated_date_raw: '2023-07-20T03:27:32.000Z',
                },
                created_date_raw: '2023-07-05T01:34:12.000Z',
                updated_date_raw: '2023-07-05T01:34:12.000Z',
              },
              opt_out_whatsapp_date_raw: null,
              opt_out_whatsapp_date_seconds: '',
              opt_out_whatsapp_date_time_ago: '',
              permalink_sent_date_raw: null,
              permalink_sent_date_seconds: '',
              permalink_sent_date_time_ago: '',
              appointment_date_raw: null,
              appointment_date_seconds: '',
              appointment_date_time_ago: '',
              created_date_raw: '2023-07-05T06:14:48.000Z',
              updated_date_raw: '2023-07-08T04:20:23.000Z',
            },
            broadcast_date_raw: '2023-07-05T14:14:48.000Z',
            broadcast_date_seconds: 1688566488000,
            broadcast_date_time_ago: 'a month ago',
            last_msg_date_raw: '2023-07-19T01:52:00.000Z',
            last_msg_date_seconds: 1689731520000,
            last_msg_date_time_ago: '12 days ago',
            created_date_raw: '2023-07-19T09:52:27.000Z',
            updated_date_raw: '2023-07-26T09:55:15.000Z',
            agency_user_read: true,
            latest_whatsapp_chat_id: 'e4f6e222-e46f-4d4d-8010-eee7d6c2dac5',
            last_msg_type: 'text',
          },
        },
      );

      h.api.createResponse(
        req,
        res,
        200,
        { msg: 'called!' },
        '1-inbox-1622176002',
        {
          portal,
        },
      );
    },
  });

  fastify.route({
    method: 'GET',
    url: '/staff/unified-inbox/:chat_id',
    preValidation: async (req, res) => {
      await Promise.all([
        userMiddleware.isLoggedIn(req, res),
        userMiddleware.hasAccessToStaffPortal(req, res),
      ]);
    },
    schema: {
      params: {
        chat_id: { type: 'string' },
      },
    },
    handler: async (req, res) => {
      try {
        const { chat_id } = req.params;
        const { user_id } = h.user.getCurrentUser(req);
        const include = [
          { model: models.agency_user, include: models.user },
          {
            model: models.contact,
            include: [
              { model: models.agency_user, include: [{ model: models.user }] },
            ],
          },
        ];
        const unifiedInbox = await c.unifiedInbox.findOne(
          {
            msg_id: chat_id,
          },
          {
            include,
          },
        );

        h.api.createResponse(
          req,
          res,
          200,
          { chat: unifiedInbox },
          '1-inbox-1622176002',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'GET',
          url: '/v1/staff/unified-inbox/:chat_id',
        });
        h.api.createResponse(req, res, 500, {}, '2-inbox-1622176015', {
          portal,
        });
      }
    },
  });

  next();
};
