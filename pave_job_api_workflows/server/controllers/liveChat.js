const h = require('../helpers');
const { Op } = require('sequelize');
const jsforce = require('jsforce');
const config = require('../configs/config')(process.env.NODE_ENV);
const BPromise = require('bluebird');
const Axios = require('axios');

module.exports.makeController = (models) => {
  const {
    appsync_credentials: appsyncModel,
    live_chat: liveChatModel,
    live_chat_session: liveChatSessionModel,
    contact: contactModel,
    unified_inbox: unifiedInboxModel,
    agency: agencyModel,
    agency_user: agencyUserModel,
  } = models;

  const contactSalesforceData =
    require('./contactSalesforceData').makeController(models);

  const liveChatCtl = {};

  /**
   * Create live_chat record
   * @param {{
   *  agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  session_id: string,
   *  msg_type: string,
   *  msg_body: string,
   *  media_url: string,
   *  content_type: string,
   *  file_name: string,
   *  reply_to_live_chat_id: string,
   *  reply_to_content: string,
   *  reply_to_msg_type: string,
   *  reply_to_file_name: string,
   *  reply_to_contact_id: string,
   *  caption: string,
   *  msg_timestamp: number,
   *  sender_number: string,
   *  receiver_number: string,
   *  delivered: number,
   *  sent: number,
   *  failed: number,
   *  read: number,
   *  replied: number,
   *  created_by: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  liveChatCtl.create = async (record, { transaction } = {}) => {
    const funcName = 'liveChatCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      contact_fk,
      agency_user_fk,
      session_id,
      msg_type,
      msg_body,
      media_url,
      content_type,
      file_name,
      reply_to_live_chat_id,
      reply_to_content,
      reply_to_msg_type,
      reply_to_file_name,
      reply_to_contact_id,
      caption,
      msg_timestamp,
      sender_number,
      receiver_number,
      delivered,
      sent,
      failed,
      read,
      replied,
      created_by,
    } = record;
    const live_chat_id = h.general.generateId();
    const sanitizedEscapedContent = h.general.sanitizeMaliciousAttributes(msg_body);
    await liveChatModel.create(
      {
        live_chat_id,
        agency_fk,
        contact_fk,
        agency_user_fk,
        session_id,
        msg_type,
        msg_body: sanitizedEscapedContent,
        media_url,
        content_type,
        file_name,
        reply_to_live_chat_id,
        reply_to_content,
        reply_to_msg_type,
        reply_to_file_name,
        reply_to_contact_id,
        caption,
        msg_timestamp,
        sender_number,
        receiver_number,
        delivered,
        sent,
        failed,
        read,
        replied,
        created_by,
      },
      { transaction },
    );

    return live_chat_id;
  };

  /**
   * Update live_chat record
   * @param {string} live_chat_id
   * @param {{
   *  agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  session_id: string,
   *  msg_type: string,
   *  msg_body: string,
   *  media_url: string,
   *  content_type: string,
   *  file_name: string,
   *  reply_to_live_chat_id: string,
   *  reply_to_content: string,
   *  reply_to_msg_type: string,
   *  reply_to_file_name: string,
   *  reply_to_contact_id: string,
   *  caption: string,
   *  msg_timestamp: number,
   *  sender_number: string,
   *  receiver_number: string,
   *  delivered: number,
   *  sent: number,
   *  failed: number,
   *  read: number,
   *  replied: number,
   *	updated_by: string
   * }} record
   * @param {string} updated_by
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  liveChatCtl.update = async (
    live_chat_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'liveChatCtl.update';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      contact_fk,
      agency_user_fk,
      session_id,
      msg_type,
      msg_body,
      media_url,
      content_type,
      file_name,
      reply_to_live_chat_id,
      reply_to_content,
      reply_to_msg_type,
      reply_to_file_name,
      reply_to_contact_id,
      caption,
      msg_timestamp,
      sender_number,
      receiver_number,
      delivered,
      sent,
      failed,
      read,
      replied,
    } = record;

    await liveChatModel.update(
      {
        agency_fk,
        contact_fk,
        agency_user_fk,
        session_id,
        msg_type,
        msg_body,
        media_url,
        content_type,
        file_name,
        reply_to_live_chat_id,
        reply_to_content,
        reply_to_msg_type,
        reply_to_file_name,
        reply_to_contact_id,
        caption,
        msg_timestamp,
        sender_number,
        receiver_number,
        delivered,
        sent,
        failed,
        read,
        replied,
        updated_by,
      },
      {
        where: { live_chat_id },
        transaction,
      },
    );

    return live_chat_id;
  };

  /**
   * Find all live_chat records
   * @param {{
   *  live_chat_id: string,
   *  agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  session_id: string,
   *  msg_type: string,
   *  msg_body: string,
   *  media_url: string,
   *  content_type: string,
   *  file_name: string,
   *  reply_to_live_chat_id: string,
   *  reply_to_content: string,
   *  reply_to_msg_type: string,
   *  reply_to_file_name: string,
   *  reply_to_contact_id: string,
   *  caption: string,
   *  msg_timestamp: number,
   *  sender_number: string,
   *  receiver_number: string,
   *  delivered: number,
   *  sent: number,
   *  failed: number,
   *  read: number,
   *  replied: number,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  liveChatCtl.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'liveChatCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await liveChatModel.findAll({
      where: { ...where },
      offset,
      limit,
      subQuery,
      include,
      transaction,
      order,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one live_chat record
   * @param {{
   *  live_chat_id: string,
   *  agency_fk: string,
   *  contact_fk: string,
   *  agency_user_fk: string,
   *  session_id: string,
   *  msg_type: string,
   *  msg_body: string,
   *  media_url: string,
   *  content_type: string,
   *  file_name: string,
   *  reply_to_live_chat_id: string,
   *  reply_to_content: string,
   *  reply_to_msg_type: string,
   *  reply_to_file_name: string,
   *  reply_to_contact_id: string,
   *  caption: string,
   *  msg_timestamp: number,
   *  sender_number: string,
   *  receiver_number: string,
   *  delivered: number,
   *  sent: number,
   *  failed: number,
   *  read: number,
   *  replied: number,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  liveChatCtl.findOne = async (where, { include, order, transaction } = {}) => {
    const funcName = 'liveChatCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await liveChatModel.findOne({
      where: { ...where },
      include,
      order,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete live_chat record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  liveChatCtl.destroy = async (where, { transaction } = {}) => {
    const funcName = 'liveChatCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await liveChatModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Receive live chat message
   * @param {string} session_id
   * @param {object} data
   * @param {object} log
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  liveChatCtl.receiveMessage = async (
    session_id,
    data,
    log,
    { transaction },
  ) => {
    const funcName = 'liveChatCtl.receiveMessage';
    const { msg_type, content, content_type, file_name, encryptionKeys } = data;
    const liveSession = await liveChatSessionModel.findOne({
      where: {
        live_chat_session_id: session_id,
        status: 'active',
      },
    });
    if (!h.isEmpty(liveSession)) {
      const contactRecord = await contactModel.findOne({
        where: {
          contact_id: liveSession.dataValues.contact_fk,
        },
      });

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

      const agency_user = await agencyUserModel.findOne({
        where: {
          agency_user_id: contactRecord.dataValues.agency_user_fk,
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

      const live_chat_id = h.general.generateId();
      const timestamp = Math.floor(Date.now() / 1000);

      let media_url = null;

      if (['image', 'video', 'file'].includes(msg_type)) {
        media_url = content;
      }

      const sanitizedEscapedContent = h.general.sanitizeMaliciousAttributes(content);

      await liveChatModel.create(
        {
          live_chat_id,
          agency_fk: contactRecord.dataValues.agency_fk,
          contact_fk: liveSession.dataValues.contact_fk,
          agency_user_fk: contactRecord.dataValues.agency_user_fk,
          session_id: session_id,
          msg_type: msg_type,
          msg_timestamp: timestamp,
          msg_body: sanitizedEscapedContent,
          media_url,
          content_type,
          file_name,
          sender_number: liveSession.dataValues.contact_fk,
          receiver_number: contactRecord.dataValues.agency_user_fk,
          delivered: 1,
          sent: 1,
          failed: 0,
          read: 0,
          created_by: null,
        },
        { transaction },
      );

      const liveChatInbox = await unifiedInboxModel.findOne({
        where: {
          agency_fk: contactRecord.dataValues.agency_fk,
          contact_fk: liveSession.dataValues.contact_fk,
          msg_platform: 'livechat',
        },
        order: [['created_date', 'DESC']],
      });

      if (h.isEmpty(liveChatInbox)) {
        await unifiedInboxModel.create(
          {
            tracker_id: session_id,
            campaign_name: 'Live Chat',
            tracker_ref_name: session_id,
            agency_fk: contactRecord.dataValues.agency_fk,
            contact_fk: liveSession.dataValues.contact_fk,
            agency_user_fk: contactRecord.dataValues.agency_user_fk,
            event_id: null,
            msg_type: msg_type,
            msg_body: content,
            msg_platform: 'livechat',
            pending: 0,
            failed: 0,
            sent: 1,
            delivered: 1,
            read: 1,
            replied: 1,
            batch_count: 1,
            created_by: null,
            broadcast_date: new Date(),
            last_msg_date: new Date(),
            template_count: 0,
            tracker_type: 'main',
            sender: liveSession.dataValues.contact_fk,
            receiver: contactRecord.dataValues.agency_user_fk,
          },
          {
            transaction,
          },
        );
      } else {
        await unifiedInboxModel.update(
          {
            tracker_id: session_id,
            campaign_name: 'Live Chat',
            tracker_ref_name: session_id,
            agency_fk: contactRecord.dataValues.agency_fk,
            contact_fk: liveSession.dataValues.contact_fk,
            agency_user_fk: contactRecord.dataValues.agency_user_fk,
            event_id: null,
            msg_type: msg_type,
            msg_body: content,
            msg_platform: 'livechat',
            batch_count: 1,
            replied: 1,
            created_by: null,
            broadcast_date: new Date(),
            last_msg_date: new Date(),
            template_count: 0,
            tracker_type: 'main',
            sender: liveSession.dataValues.contact_fk,
            receiver: contactRecord.dataValues.agency_user_fk,
          },
          {
            where: {
              unified_inbox_id: liveChatInbox.dataValues.unified_inbox_id,
            },
          },
          {
            transaction,
          },
        );
      }

      await transaction.commit();

      const created_date = new Date();

      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      const date = new Date(created_date);
      const formattedDate = date.toLocaleDateString('en-US', options);

      const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
      const formattedTime = date.toLocaleTimeString('en-US', timeOptions);

      const appsync = await appsyncModel.findOne({
        where: {
          status: 'active',
        },
      });
      const api_key = appsync.dataValues.api_key;

      await h.appsync.sendGraphQLNotification(api_key, {
        platform: 'livechat',
        campaign_name: 'Live Chat',
        agency_fk: contactRecord.dataValues.agency_fk,
        contact_id: contactRecord.dataValues.contact_id,
        contact_fk: contactRecord.dataValues.contact_id,
        agency_user_fk: contactRecord.dataValues.agency_user_fk,
        session_id: session_id,
        msg_type: msg_type,
        message: content,
        media_msg_id: null,
        media_url,
        content_type,
        file_name,
        caption: null,
        msg_timestamp: timestamp,
        sender_number: liveSession.dataValues.contact_fk,
        receiver_number: contactRecord.dataValues.agency_user_fk,
        sender: liveSession.dataValues.contact_fk,
        receiver: contactRecord.dataValues.agency_user_fk,
        reply_to_event_id: null,
        reply_to_content: null,
        reply_to_msg_type: null,
        reply_to_file_name: null,
        reply_to_contact_id: null,
        sent: 1,
        delivered: 1,
        read: 0,
        created_date_raw: new Date(),
        created_date: `${formattedDate} ${formattedTime}`,
        side: 'contact',
      });

      await h.livechat.notifyMessageInteraction({
        agency_id: contactRecord.agency_fk,
        agent_name: agency_user.user.dataValues.first_name,
        agent_email: agency_user.user.dataValues.email,
        additional_emails:
          agency_user.agency.dataValues.agency_campaign_additional_recipient,
        contact_name: fullName,
        msg: content,
        msgType: msg_type,
        log,
      });

      const liveChatSettings = await models.live_chat_settings.findOne({
        where: {
          agency_fk: contactRecord.agency_fk,
        },
      });

      if (
        h.isEmpty(liveChatSettings) ||
        h.isEmpty(liveChatSettings.dataValues)
      ) {
        log.info({
          message: 'NO ACTIVE LIVE CHAT SETTINGS',
          payload: liveChatSettings,
        });

        return false;
      }
      const salesforceEnabled =
        liveChatSettings?.dataValues?.salesforce_enabled;
      const hasOauth = !!(
        h.notEmpty(liveChatSettings.dataValues.api_oauth_url) &&
        h.notEmpty(liveChatSettings.dataValues.api_client_id) &&
        h.notEmpty(liveChatSettings.dataValues.api_client_secret)
      );
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
        console.log('can transmit message');
        const updateData = {};
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
        } = await contactSalesforceData.findOne(
          {
            agency_fk: contactRecord.agency_fk,
            contact_fk: contactRecord.contact_id,
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
        field_configurations.forEach((configuration) => {
          if (h.cmpBool(configuration.required, true)) {
            if (configuration.field in endpoint_values) {
              updateData[configuration.mappedTo] =
                endpoint_values[configuration.field];
            } else {
              if (h.cmpStr(configuration.field, 'comments')) {
                updateData[
                  configuration.mappedTo
                ] = `${fullName}: ${h.general.unescapeData(content)}`;
              }
            }
          }
        });
        if (
          (h.cmpBool(hasOauth, true) ||
            h.notEmpty(liveChatSettings.dataValues.api_update_token)) &&
          h.notEmpty(liveChatSettings.dataValues.api_update_url)
        ) {
          console.log('custom transmit message');
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
          let update_url = `${liveChatSettings.dataValues.api_url}`;
          update_url = h.cmpBool(addSalesforceID, true)
            ? `${update_url}/${contact_source.source_contact_id}`
            : update_url;
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
              return error;
            });
          console.log(sfResponse);
        } else {
          console.log('standard transmit message');
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
              conn.oauth2.refreshToken(refresh_token, async (err, results) => {
                if (err) {
                  console.log({
                    message: `Invalid credentials`,
                    processor: 'livechat-webhook-payload',
                    agency_id: contactRecord.agency_fk,
                  });

                  return resolve(null);
                }
                resolve(results);
              });
            });

            if (creds && !h.isEmpty(contact_source)) {
              const sfContact = await new BPromise((resolve, reject) => {
                conn
                  .sobject(salesforceObject)
                  .find({
                    Id: contact_source.source_contact_id,
                  })
                  .execute((err, contact) => {
                    if (err) {
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
                const sfContactCommentUpdate = await new BPromise(
                  (resolve, reject) => {
                    const comment = sfContact[0][commentField];
                    const commentToRecord =
                      comment + `\n ${fullName}: ${content}`;
                    const updateData = {
                      Id: contact_source.source_contact_id,
                    };
                    updateData[commentField] =
                      h.general.unescapeData(commentToRecord);
                    conn
                      .sobject(salesforceObject)
                      .update(updateData, function (err, ret) {
                        if (err || !ret.success) {
                          resolve([]);
                        }
                        resolve(ret);
                      });
                  },
                );
                console.log(sfContactCommentUpdate);
              }
            }
          }
        }
      }
    } else {
      log.info({
        message: 'ACTIVE SESSION NOT FOUND',
        payload: data,
      });
    }
  };

  liveChatCtl.setStatus = async (session_id, data, log, { transaction }) => {
    const funcName = 'liveChatCtl.setStatus';
    const { msg_type, side } = data;
    const liveSession = await liveChatSessionModel.findOne({
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

      if (h.cmpStr(msg_type, 'read')) {
        statusUpdate.read = 1;
        statusUpdate.sent = 1;
        statusUpdate.delivered = 1;
      }

      await liveChatModel.update(statusUpdate, {
        where: whereClause,
      });
    } else {
      log.info({
        message: 'ACTIVE SESSION NOT FOUND',
        payload: data,
      });
    }
  };

  return liveChatCtl;
};
