const Sentry = require('@sentry/node');
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const constant = require('../../../constants/constant.json');
const models = require('../../../models');
const c = require('../../../controllers');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');
const ContactService = require('../../../services/staff/contact');
const contactService = new ContactService();
const jsforce = require('jsforce');
const config = require('../../../configs/config')(process.env.NODE_ENV);
const BPromise = require('bluebird');
const Axios = require('axios');

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'GET',
    url: '/staff/live-chat',
    schema: {},
    preValidation: async (req, res) => {
      await Promise.all([
        userMiddleware.isLoggedIn(req, res),
        userMiddleware.hasAccessToStaffPortal(req, res),
      ]);
    },
    handler: async (req, res) => {
      const { contact_id, session_id } = req.query;
      const { user_id } = h.user.getCurrentUser(req);

      const currentAgencyUser = await c.agencyUser.findOne({
        user_fk: user_id,
      });

      // check if read by current agency user
      const liveChatCtlAppWhere = {
        contact_fk: contact_id,
        agency_fk: currentAgencyUser?.agency_fk,
      };

      const latestLiveChat = await c.liveChat.findOne(liveChatCtlAppWhere, {
        order: [['created_date', 'DESC']],
      });

      const [, readCount] = await Promise.all([
        models.unified_inbox.update(
          {
            msg_id: latestLiveChat?.live_chat_id,
            msg_type: latestLiveChat?.msg_type,
            msg_body: latestLiveChat?.msg_body,
            created_date: latestLiveChat?.created_date,
            updated_date: latestLiveChat?.created_date,
            last_msg_date: latestLiveChat?.created_date,
          },
          {
            where: {
              msg_platform: 'livechat',
              contact_fk: contact_id,
              agency_fk: currentAgencyUser?.agency_fk,
            },
          },
        ),
        models.agency_user_chat_read_status.count({
          where: {
            chat_id: latestLiveChat?.live_chat_id,
            chat_type: 'livechat',
            agency_user_fk: currentAgencyUser?.agency_user_id,
          },
          order: [['created_date', 'DESC']],
          limit: 1,
        }),
      ]);

      if (h.cmpInt(readCount, 0)) {
        const agency_user_chat_read_status_id = h.general.generateId();
        models.agency_user_chat_read_status.create({
          agency_user_chat_read_status_id: agency_user_chat_read_status_id,
          chat_id: latestLiveChat?.live_chat_id,
          chat_type: 'livechat',
          agency_user_fk: currentAgencyUser?.agency_user_id,
        });
      }

      let where = {};

      where = {
        contact_fk: contact_id,
        agency_fk: currentAgencyUser?.agency_fk,
      };

      if (!h.isEmpty(session_id)) {
        where.session_id = session_id;
      }

      const include = [];
      const order = [['msg_timestamp', 'DESC']];
      let live_chats = [];
      try {
        if (!h.general.isEmpty(contact_id)) {
          live_chats = await c.liveChat.findAll(where, {
            order,
            include,
          });
        }

        h.api.createResponse(
          req,
          res,
          200,
          {
            live_chats,
          },
          '1-whatsapp-messages-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/live-chat',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-messages-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/live-chat',
    schema: {
      body: {
        type: 'object',
        required: ['agency_id', 'message', 'contact_id'],
        properties: {
          agency_id: { type: 'string' },
          agent_id: { type: 'string' },
          message: { type: 'string' },
          contact_id: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { agency_id, agent_id, message, contact_id } = req.body;
      const { user_id } = h.user.getCurrentUser(req);
      try {
        const [
          appsync,
          liveChatSession,
          unifiedInboxEntry,
          contactRecord,
          user,
        ] = await Promise.all([
          c.appSyncCredentials.findOne({
            status: 'active',
          }),
          models.live_chat_session.findOne({
            where: {
              contact_fk: contact_id,
            },
            order: [['created_date', 'DESC']],
          }),
          models.unified_inbox.findOne({
            where: {
              contact_fk: contact_id,
              msg_platform: 'livechat',
            },
            order: [['created_date', 'DESC']],
          }),
          models.contact.findOne({
            where: {
              contact_id: contact_id,
            },
          }),
          models.user.findOne({
            where: {
              user_id: user_id,
            },
          }),
        ]);

        let fullName;
        if (
          contactRecord.dataValues.first_name &&
          contactRecord.dataValues.last_name
        ) {
          fullName = contactRecord.dataValues.first_name.concat(
            ' ',
            contactRecord.dataValues.last_name,
          );
        } else if (contactRecord.dataValues.first_name) {
          fullName = contactRecord.dataValues.first_name;
        } else if (contactRecord.dataValues.last_name) {
          fullName = contactRecord.dataValues.last_name;
        } else {
          fullName = 'Contact';
        }

        const agency_user = await models.agency_user.findOne({
          where: {
            agency_user_id: contactRecord.agency_user_fk,
          },
          include: [
            {
              model: models.user,
              required: true,
            },
            {
              model: models.agency,
              required: true,
            },
          ],
          order: [['created_date', 'ASC']],
        });

        const { first_name } = user;
        const agent_name = first_name;
        let updatedMessage = `<div className="test-class" style="text-align: right; display: block; font-family: PoppinsSemiBold; font-size: 15px; margin-top: -55px; margin-right: -9px; margin-bottom: 8px;"><strong>${agent_name}</strong></div>\n${message}`;

        updatedMessage = h.whatsapp.sanitizeMaliciousAttributes(updatedMessage);

        const { api_key } = appsync;

        const created_date = new Date();

        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        const date = new Date(created_date);
        const formattedDate = date.toLocaleDateString('en-US', options);

        const timeOptions = {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        };
        const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
        const timestamp = Math.floor(Date.now() / 1000);

        const live_chat_id = await c.liveChat.create({
          campaign_name: 'Live Chat',
          agency_fk: agency_id,
          agency_user_fk: agent_id,
          contact_fk: contact_id,
          session_id: liveChatSession.dataValues.live_chat_session_id,
          msg_type: 'frompave',
          msg_timestamp: timestamp,
          msg_body: updatedMessage,
          media_url: null,
          content_type: null,
          file_name: null,
          sender_number: agent_id,
          receiver_number: contact_id,
          delivered: 1,
          sent: 1,
          failed: 0,
          read: 0,
          replied: 0,
          created_by: agent_id,
        });

        await c.unifiedInbox.update(
          unifiedInboxEntry.dataValues.unified_inbox_id,
          {
            tracker_id: liveChatSession.dataValues.live_chat_session_id,
            tracker_ref_name: liveChatSession.dataValues.live_chat_session_id,
            campaign_name: 'Live Chat',
            agency_fk: agency_id,
            contact_fk: contact_id,
            event_id: null,
            msg_type: 'frompave',
            msg_body: updatedMessage,
            msg_platform: 'livechat',
            batch_count: 1,
            created_by: null,
            broadcast_date: new Date(),
            last_msg_date: new Date(),
            template_count: 0,
            tracker_type: 'main',
            sender: agent_id,
            receiver: contact_id,
          },
        );

        await h.appsync.sendGraphQLNotification(api_key, {
          platform: 'livechat',
          campaign_name: 'Live Chat',
          agency_fk: agency_id,
          agency_user_fk: agent_id,
          contact_fk: contact_id,
          original_event_id: null,
          msg_type: 'frompave',
          msg_body: updatedMessage,
          sender_number: agent_id,
          receiver_number: contact_id,
          sender: agent_id,
          receiver: contact_id,
          reply_to_event_id: null,
          reply_to_content: null,
          reply_to_msg_type: null,
          reply_to_file_name: null,
          reply_to_contact_id: null,
          sent: 1,
          delivered: 1,
          read: 0,
          broadcast_date: new Date(),
          last_msg_date: new Date(),
          created_date_raw: created_date,
          created_date: `${formattedDate} ${formattedTime}`,
          side: 'agent',
        });

        const newMsg = await c.liveChat.findOne({
          live_chat_id: live_chat_id,
        });

        h.api.createResponse(
          req,
          res,
          200,
          { newMsg },
          '1-whatsapp-message-reply-1663834299369',
          { portal },
        );

        const liveChatSettings = await models.live_chat_settings.findOne({
          where: {
            agency_fk: agency_id,
          },
        });

        const salesforceEnabled =
          liveChatSettings.dataValues.salesforce_enabled;
        const hasOauth = !!(
          h.notEmpty(liveChatSettings.dataValues.api_oauth_url) &&
          h.notEmpty(liveChatSettings.dataValues.api_client_id) &&
          h.notEmpty(liveChatSettings.dataValues.api_client_secret)
        );

        console.log('oauth check', hasOauth);
        const salesforceObject =
          liveChatSettings.dataValues.salesforce_transmission_type;
        const transmitChat =
          liveChatSettings.dataValues.salesforce_chat_logs_transmission_enabled;
        const commentField =
          liveChatSettings.dataValues.salesforce_chat_logs_transmission_field;
        const addSalesforceID = liveChatSettings.dataValues.add_salesforce_id;

        const contact_source = await models.contact_source.findOne({
          where: {
            contact_fk: contactRecord.contact_id,
            source_type: 'SALESFORCE',
          },
        });

        if (
          !h.isEmpty(contact_source) &&
          h.cmpBool(salesforceEnabled, true) &&
          h.cmpBool(transmitChat, true) &&
          !h.isEmpty(commentField)
        ) {
          const portalMessage = message.split('</div>\n');
          if (
            (h.cmpBool(hasOauth, true) ||
              h.notEmpty(liveChatSettings.dataValues.api_update_token)) &&
            h.notEmpty(liveChatSettings.dataValues.api_update_url)
          ) {
            console.log('using custom setup');
            const { ek: encryptionKeys } = req.ek;
            let token;
            if (
              h.isEmpty(liveChatSettings.dataValues.api_update_token) &&
              hasOauth
            ) {
              const decrypted_client_id = h.crypto.decrypt(
                {
                  encryptionKey: encryptionKeys.encryption_key,
                  encryptionIv: encryptionKeys.encryption_iv,
                },
                liveChatSettings.dataValues.api_client_id,
              );

              const decrypted_client_secret = h.crypto.decrypt(
                {
                  encryptionKey: encryptionKeys.encryption_key,
                  encryptionIv: encryptionKeys.encryption_iv,
                },
                liveChatSettings.dataValues.api_client_secret,
              );

              const requestInfo = new URLSearchParams();

              requestInfo.append('grant_type', 'client_credentials');
              requestInfo.append('client_id', decrypted_client_id);
              requestInfo.append('client_secret', decrypted_client_secret);

              const headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
              };

              const sfOauthResponse = await Axios.post(
                liveChatSettings.dataValues.api_oauth_url,
                requestInfo,
                {
                  headers,
                },
              );
              token = sfOauthResponse.data.access_token;
            } else {
              const decrypted_api_update_token = h.crypto.decrypt(
                {
                  encryptionKey: encryptionKeys.encryption_key,
                  encryptionIv: encryptionKeys.encryption_iv,
                },
                liveChatSettings.dataValues.api_update_token,
              );
              token = decrypted_api_update_token;
            }
            let update_url = `${liveChatSettings.dataValues.api_update_url}`;
            update_url = h.cmpBool(addSalesforceID, true)
              ? `${update_url}/${contact_source.source_contact_id}`
              : update_url;
            const field_configurations = JSON.parse(
              liveChatSettings.dataValues.field_configuration,
            );
            const {
              first_name,
              last_name,
              email,
              mobile,
              language,
              interested_product,
              interested_city,
              enable_marketing,
              lead_source,
              lead_source_lv1,
              lead_source_lv2,
              tnc_date,
            } = await c.contactSalesforceData.findOne(
              {
                agency_fk: agency_id,
                contact_fk: contact_id,
              },
              {
                order: [['created_date', 'DESC']],
              },
            );
            const endpoint_values = {
              first_name: first_name,
              last_name: last_name,
              email_address: email,
              product: interested_product,
              city: interested_city,
              language: language,
              phone: mobile,
              marketing: enable_marketing,
              lead_source: lead_source,
              lead_channel: lead_source_lv1,
              origin: lead_source_lv2,
              consent_date: tnc_date,
            };
            console.log(endpoint_values);
            const updateData = {};
            field_configurations.forEach((configuration) => {
              if (h.cmpBool(configuration.required, true)) {
                if (configuration.field in endpoint_values) {
                  updateData[configuration.mappedTo] =
                    endpoint_values[configuration.field];
                } else {
                  if (h.cmpStr(configuration.field, 'comments')) {
                    updateData[configuration.mappedTo] = `${user.first_name} ${
                      user.last_name
                    }: ${h.general.unescapeData(portalMessage[1])}`;
                  }
                }
              }
            });
            const sfConfig = {
              method: 'put',
              url: update_url,
              headers: {
                Authorization: `Basic ${token}`,
                'Content-Type': 'application/json',
              },
              data: updateData,
            };
            const sfResponse = await Axios(sfConfig)
              .then(function (response) {
                return response.data;
              })
              .catch(function (error) {
                Sentry.captureException(error);
                return error;
              });
            console.log(sfResponse);
          } else {
            console.log('using standard setup');
            let agencyOauth = await models.agency_oauth.findOne({
              where: {
                agency_fk: contactRecord.agency_fk,
                status: 'active',
                source: 'SALESFORCE',
              },
            });

            agencyOauth =
              agencyOauth && agencyOauth.toJSON
                ? agencyOauth.toJSON()
                : agencyOauth;

            if (!agencyOauth) {
              // finish execution here
              console.log({
                message: `No OAuth credentials`,
                processor: 'waba-process-webhook-payload',
                agency_id: contactRecord.agency_fk,
              });
            } else {
              const { access_token, refresh_token, instance_url } = JSON.parse(
                agencyOauth.access_info,
              );

              const oauthParams = {
                clientId: config.directIntegrations.salesforce.clientId,
                clientSecret: config.directIntegrations.salesforce.clientSecret,
                redirectUri: config.directIntegrations.salesforce.redirectUri,
              };

              if (instance_url.includes('sandbox')) {
                oauthParams.loginUrl = 'https://test.salesforce.com';
              }

              const oauth2 = new jsforce.OAuth2(oauthParams);

              const connParams = {
                oauth2,
                instanceUrl: instance_url,
                accessToken: access_token,
                refreshToken: refresh_token,
              };

              if (instance_url.includes('sandbox')) {
                connParams.loginUrl = 'https://test.salesforce.com';
              }

              const conn = new jsforce.Connection(connParams);

              const creds = await new BPromise((resolve, reject) => {
                conn.oauth2.refreshToken(
                  refresh_token,
                  async (err, results) => {
                    if (err) {
                      console.log({
                        err,
                        message: `Invalid credentials`,
                        processor: 'livechat-webhook-payload',
                        agency_id: contactRecord.agency_fk,
                      });

                      return resolve(null);
                    }
                    resolve(results);
                  },
                );
              });

              const contact_source = await models.contact_source.findOne({
                where: {
                  contact_fk: contactRecord.contact_id,
                  source_type: 'SALESFORCE',
                },
              });

              if (creds && !h.isEmpty(contact_source)) {
                const sfContact = await new BPromise((resolve, reject) => {
                  conn
                    .sobject(salesforceObject)
                    .find(
                      // conditions in JSON object
                      {
                        Id: contact_source.source_contact_id,
                      },
                    )
                    .execute((err, contact) => {
                      if (err) {
                        // log error
                        console.log({
                          err,
                          message: `Unable to fetch New Contact`,
                          processor: 'livechat-webhook-payload',
                          agency_id: contactRecord.agency_fk,
                        });
                        resolve([]);
                      }
                      resolve(contact);
                    });
                });
                if (sfContact && !h.cmpInt(sfContact.length, 0)) {
                  const portalMessage = message.split('</div>\n');
                  const sfContactCommentUpdate = await new BPromise(
                    (resolve, reject) => {
                      const comment = sfContact[0][commentField];
                      const toRecordComment =
                        comment +
                        `\n ${user.first_name} ${
                          user.last_name
                        }: ${h.general.unescapeData(portalMessage[1])}`;
                      const commentUpdate = {
                        Id: contact_source.source_contact_id,
                      };
                      commentUpdate[commentField] = toRecordComment;
                      conn
                        .sobject(salesforceObject)
                        .update(commentUpdate, function (err, ret) {
                          if (err || !ret.success) {
                            console.log('comment error', err);
                            resolve([]);
                          }
                          resolve(ret);
                        });
                    },
                  );
                }
              }
            }
          }
        }
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'POST',
          url: '/v1/staff/live-chat',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-message-failed-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/live-chat/message/status',
    schema: {
      body: {
        type: 'object',
        required: ['session_id', 'status', 'side'],
        properties: {
          session_id: { type: 'string' },
          status: { type: 'string' },
          side: { type: 'string' },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { session_id, status, side } = req.body;
      try {
        const liveSession = await models.live_chat_session.findOne({
          where: {
            live_chat_session_id: session_id,
            status: 'active',
          },
        });

        if (!h.isEmpty(liveSession)) {
          const whereClause = {
            session_id: session_id,
          };

          if (h.cmpStr(side, 'contact')) {
            whereClause.sender_number = liveSession.dataValues.contact_fk;
          } else {
            whereClause.sender_number = {
              [Op.ne]: liveSession.dataValues.contact_fk,
            };
          }

          const statusUpdate = {
            sent: true,
          };

          if (h.cmpStr(status, 'read')) {
            statusUpdate.read = 1;
            statusUpdate.sent = 1;
            statusUpdate.delivered = 1;
          }

          await models.live_chat.update(statusUpdate, {
            where: whereClause,
          });
        }
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/staff/live-chat/message/status',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-whatsapp-messages-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  next();
};
