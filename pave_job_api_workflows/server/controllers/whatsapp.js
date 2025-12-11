const h = require('../helpers');
const constant = require('../constants/constant.json');
const { Op } = require('sequelize');
const axios = require('axios');
module.exports.makeController = (models) => {
  const agencyWhatsAppConfigCtrl =
    require('./agencyWhatsappConfig').makeController(models);
  const whatsappMessageTrackerCtrl =
    require('./whatsappMessageTracker').makeController(models);
  const whatsappChatCtrl = require('./whatsappChat').makeController(models);
  const appSyncCredentialsCtrl = require('./appSyncCredentials').makeController(
    models,
  );
  const agencyCtrl = require('./agency').makeAgencyController(models);
  const contactCtrl = require('./contact').makeContactController(models);
  const contactSalesforceDataCtrl =
    require('./contactSalesforceData').makeController(models);
  const contactActivityCtrl =
    require('./contactActivity').makeContactActivityController(models);
  const agencyUserCtrl =
    require('./agencyUser').makeAgencyUserController(models);
  const unifiedInboxCtrl = require('./unifiedInbox').makeController(models);
  const unsubscribeTextCtrl =
    require('./unsubscribeText').makeController(models);
  const shortlistedProjectCtrl =
    require('./shortlistedProject').makeShortListedProjectController(models);
  const campaignCTACtrl = require('./campaignCta').makeController(models);
  const messageInventory = require('./messageInventory').makeController(models);
  const agencyNotification = require('./agencyNotification').makeController(
    models,
  );
  const whatsAppCtrl = {};

  /**
   * The code snippet is defining an asynchronous function called `handleWhatsAppMessageStatus` within an object or class
   * named `whatsAppCtrl`. This function is for handling all message status
   * @async
   * @constant
   * @name handleWhatsAppMessageStatus
   * @type {{ handleWhatsAppMessageStatus({ agency_id, original_event_id, msg_id, msg_timestamp, sender_number, receiver_number, sender_url, receiver_url, forUpdate, msg_type, failed_reason, models, log, additionalConfig, }: { agency_id: any; original_event_id: any; msg_id: any; msg_timestamp: any; sender_number: any; receiver_number: any; sender_url: any; receiver_url: any; forUpdate: any; ... 4 more ...; additionalConfig: any; }, { transaction }?: { ...; }): Promise<...>; }}
   */
  whatsAppCtrl.handleWhatsAppMessageStatus = async (
    {
      agency_id,
      original_event_id,
      msg_id,
      msg_timestamp,
      sender_number,
      receiver_number,
      sender_url,
      receiver_url,
      forUpdate,
      msg_type,
      failed_reason,
      models,
      log,
      additionalConfig,
    },
    { transaction } = {},
  ) => {
    log.info({
      function: 'handleWhatsAppMessageStatus',
      original_event_id: original_event_id,
      msg_timestamp: msg_timestamp,
      msg_id: msg_id,
    });

    try {
      let whatsapp_chat_id;
      const wabaOwner = await agencyWhatsAppConfigCtrl.findOne(
        {
          waba_number: sender_number,
        },
        { transaction },
      );
      const whatsappMsgTracker = await whatsappMessageTrackerCtrl.findOne(
        {
          original_event_id,
          agency_fk: agency_id,
        },
        {
          order: [['created_date', 'DESC']],
          transaction,
        },
      );

      await models.unified_inbox.update(
        {
          pending: 0,
        },
        {
          where: {
            receiver: receiver_number,
            msg_platform: 'whatsapp',
          },
          transaction,
        },
      );

      if (whatsappMsgTracker) {
        // there is a record in whatsapp message tracker - most likely the initial message
        log.info({
          action: 'update proposal tracker in whatsapp chat',
          agency_fk: whatsappMsgTracker?.agency_fk,
          contact_fk: whatsappMsgTracker?.contact_fk,
          agency_user_fk: whatsappMsgTracker?.agency_user_fk,
          msg_id,
          ...forUpdate,
          sender_number,
          sender_url,
          receiver_number,
          receiver_url,
          original_event_id: original_event_id,
          failed_reason,
        });

        const trackerUpdate = {
          agency_fk: whatsappMsgTracker?.agency_fk,
          agency_user_fk: whatsappMsgTracker?.agency_user_fk,
          contact_fk: whatsappMsgTracker?.contact_fk,
          ...forUpdate,
          sender_number: sender_number,
          sender_url: sender_url,
          receiver_number: receiver_number,
          receiver_url: receiver_url,
        };

        if (!h.isEmpty(failed_reason)) {
          trackerUpdate.failed_reason = failed_reason;
        }

        await whatsappMessageTrackerCtrl.update(
          whatsappMsgTracker?.whatsapp_message_tracker_id,
          trackerUpdate,
          null,
          transaction,
        );

        await models.unified_inbox.update(
          {
            pending: 0,
          },
          {
            where: {
              sender: sender_number,
              receiver: receiver_number,
              msg_platform: 'whatsapp',
            },
            transaction,
          },
        );

        const trackerChat = await whatsappChatCtrl.findOne(
          {
            original_event_id,
            msg_type: 'frompave',
          },
          {
            order: [['created_date', 'DESC']],
            transaction,
          },
        );

        // if tracker message is also available already in whatsapp_chat (this is for campaign messages)
        if (trackerChat) {
          whatsapp_chat_id = trackerChat?.whatsapp_chat_id;
          const chatForUpdate = forUpdate;
          delete chatForUpdate.pending;
          log.info({
            action: 'with whatsapp chat entry',
          });
          const chatUpdate = {
            campaign_name: whatsappMsgTracker?.campaign_name,
            agency_fk: whatsappMsgTracker?.agency_fk,
            contact_fk: whatsappMsgTracker?.contact_fk,
            agency_user_fk: whatsappMsgTracker?.agency_user_fk,
            ...chatForUpdate,
            sender_number,
            sender_url,
            receiver_number,
            receiver_url,
          };
          if (!h.isEmpty(failed_reason)) {
            chatUpdate.failed_reason = failed_reason;
          }
          await models.whatsapp_chat.update(chatUpdate, {
            where: {
              original_event_id,
              campaign_name: whatsappMsgTracker?.campaign_name,
              sender_number: sender_number,
              receiver_number: receiver_number,
              msg_type: 'frompave',
            },
            transaction,
          });
        } else {
          const chatForUpdate = forUpdate;
          delete chatForUpdate.pending;

          const whatsappChat = await whatsappChatCtrl.findOne(
            {
              original_event_id,
              msg_type: 'frompave',
            },
            {
              order: [['created_date', 'DESC']],
              transaction,
            },
          );

          if (!whatsappChat) {
            log.info({
              action: 'no whatsapp chat with same original event id',
            });
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
            whatsapp_chat_id = await whatsappChatCtrl.create(
              {
                ...chatForUpdate,
                campaign_name: whatsappMsgTracker?.campaign_name,
                agency_fk: whatsappMsgTracker?.agency_fk,
                contact_fk: whatsappMsgTracker?.contact_fk,
                agency_user_fk: whatsappMsgTracker?.agency_user_fk,
                original_event_id,
                msg_id,
                msg_body: whatsappMsgTracker?.msg_body,
                msg_type: 'frompave',
                msg_origin: whatsappMsgTracker?.msg_origin,
                msg_timestamp,
                sender_number,
                sender_url,
                receiver_number,
                receiver_url,
                failed_reason,
                created_date: created_date,
              },
              { transaction },
            );

            const appsync = await appSyncCredentialsCtrl.findOne({
              status: 'active',
            });
            const { api_key } = appsync;

            await h.appsync.sendGraphQLNotification(api_key, {
              position: 1,
              platform: 'whatsapp',
              ...chatForUpdate,
              campaign_name: whatsappMsgTracker?.campaign_name,
              agency_fk: whatsappMsgTracker?.agency_fk,
              contact_fk: whatsappMsgTracker?.contact_fk,
              agency_user_fk: whatsappMsgTracker?.agency_user_fk,
              original_event_id,
              msg_id,
              msg_body: whatsappMsgTracker?.msg_body,
              msg_type: 'frompave',
              msg_timestamp,
              sender_number,
              sender_url,
              receiver_number,
              receiver_url,
              reply_to_event_id: null,
              reply_to_content: null,
              reply_to_msg_type: null,
              reply_to_file_name: null,
              reply_to_contact_id: null,
              created_date_raw: new Date(),
              created_date: `${formattedDate} ${formattedTime}`,
              failed_reason,
            });

            const contact_source = await models.contact_source.findOne({
              where: {
                contact_fk: whatsappMsgTracker?.contact_fk,
                source_type: 'SALESFORCE',
              },
            });
            if (!h.isEmpty(contact_source)) {
              const agencyUser = await models.agency_user.findOne({
                where: {
                  agency_user_id: whatsappMsgTracker?.agency_user_fk,
                },
                include: [
                  {
                    model: models.user,
                    required: true,
                  },
                  { model: models.agency, required: true },
                ],
              });
              const contactRecord = await contactCtrl.findOne({
                contact_id: whatsappMsgTracker?.contact_fk,
                agency_fk: wabaOwner?.agency_fk,
              });
              const liveChatSettings = await models.live_chat_settings.findOne({
                where: {
                  agency_fk: whatsappMsgTracker?.agency_fk,
                },
              });
              const agencyOauth = await models.agency_oauth.findOne({
                where: {
                  agency_fk: whatsappMsgTracker?.agency_fk,
                  status: 'active',
                  source: 'SALESFORCE',
                },
              });
              const contactSalesforceData =
                await contactSalesforceDataCtrl.findOne(
                  {
                    agency_fk: whatsappMsgTracker?.agency_fk,
                    contact_fk: whatsappMsgTracker?.contact_fk,
                  },
                  {
                    order: [['created_date', 'DESC']],
                  },
                );
              await h.salesforce.transmitMessage({
                liveChatSettings,
                contactSalesforceData,
                oauth: agencyOauth,
                contact: contactRecord,
                contact_source,
                currentAgencyUser: agencyUser,
                full_message_body: whatsappMsgTracker?.msg_body,
                messageType: 'template',
                platform: 'whatsapp',
                log,
                encryptionKeys: additionalConfig.ek,
              });
            }
          } else {
            whatsapp_chat_id = whatsappChatCtrl?.whatsapp_chat_id;
            log.info({
              action: 'with whatsapp chat of same original event id',
            });
            const chatUpdate = {
              campaign_name: whatsappMsgTracker?.campaign_name,
              agency_fk: whatsappMsgTracker?.agency_fk,
              contact_fk: whatsappMsgTracker?.contact_fk,
              agency_user_fk: whatsappMsgTracker?.agency_user_fk,
              ...chatForUpdate,
              sender_number,
              sender_url,
              receiver_number,
              receiver_url,
            };
            if (!h.isEmpty(failed_reason)) {
              chatUpdate.failed_reason = failed_reason;
            }
            await models.whatsapp_chat.update(chatUpdate, {
              where: {
                original_event_id,
                whatsapp_chat_id: whatsappChatCtrl.whatsapp_chat_id,
              },
              transaction,
            });
          }
        }

        // give contact activity score when read
        if (msg_type === 'read') {
          await whatsAppCtrl.handleContactActivity(
            { whatsappMsgTracker, log },
            { transaction },
          );
        }

        await models.unified_inbox.update(
          {
            agency_fk: whatsappMsgTracker?.agency_fk,
            agency_user_fk: whatsappMsgTracker?.agency_user_fk,
            contact_fk: whatsappMsgTracker?.contact_fk,
            ...forUpdate,
            sender: sender_number,
            sender_url: sender_url,
            receiver: receiver_number,
            receiver_url: receiver_url,
            tracker_type: 'main',
            msg_id: whatsapp_chat_id,
          },
          {
            where: {
              tracker_id: whatsappMsgTracker?.whatsapp_message_tracker_id,
              msg_platform: 'whatsapp',
            },
            transaction,
          },
        );
      } else {
        // if the message status is for a message found only in whatsapp_chat table
        const whatsappChat = await whatsappChatCtrl.findOne(
          {
            original_event_id,
          },
          {
            order: [['created_date', 'DESC']],
            transaction,
          },
        );

        // if found - do update status
        if (whatsappChat) {
          whatsapp_chat_id = whatsappChat?.whatsapp_chat_id;
          const chatForUpdate = forUpdate;
          delete chatForUpdate.pending;
          await models.whatsapp_chat.update(
            {
              ...chatForUpdate,
              failed_reason,
            },
            {
              where: {
                original_event_id,
              },
              transaction,
            },
          );
        }
      }
    } catch (err) {
      log.error({ err });
      throw new Error('handleWhatsAppMessageStatus ERROR');
    }
  };

  /**
   * The code snippet provided seems to be incomplete and contains some characters that are not valid in JavaScript syntax.
   * It appears to be defining a function or method named `handleContactActivity` within an object or class named
   * `whatsAppCtrl`. This gives score to read activity
   * @async
   * @constant
   * @name handleContactActivity
   */
  whatsAppCtrl.handleContactActivity = async (
    { whatsappMsgTracker, log },
    { transaction },
  ) => {
    try {
      const contactActivityData = {
        activity_type: constant.CONTACT.ACTIVITY.TYPE.READ_WHATSAPP,
        activity_meta: '',
        activity_ip: null,
        viewed_on_device: 'Mobile',
        activity_date: h.date.getSqlCurrentDate(),
        created_by: whatsappMsgTracker?.contact_fk,
        contact_fk: whatsappMsgTracker?.contact_fk,
      };

      await h.database.transaction(async (transaction) => {
        await contactActivityCtrl.create(contactActivityData, {
          transaction,
        });
      });

      await models.contact_lead_score.create(
        {
          contact_lead_score_id: h.general.generateId(),
          contact_fk: whatsappMsgTracker?.contact_fk,
          score: 2,
        },
        { transaction },
      );

      await models.contact.increment(
        {
          lead_score: 2,
          last_24_hour_lead_score: 2,
          last_24_hour_lead_score_diff: 2,
        },
        {
          where: { contact_id: whatsappMsgTracker?.contact_fk },
          transaction,
        },
      );
    } catch (error) {
      log.info({ message: '💥💥💥💥💥CONTACT ACTIVITY ERROR💥💥💥💥💥' });
      console.log('💥💥💥💥💥CONTACT ACTIVITY ERROR💥💥💥💥💥');
      log.error({ error: error });
      log.info({ message: '💥💥💥💥💥END ERROR💥💥💥💥💥' });
      console.log('💥💥💥💥💥END ERROR💥💥💥💥💥');
      throw new Error('CONTACT ACTIVITY ERROR');
    }
  };

  /**
   * The above code snippet is defining an asynchronous function `getReplyToDetails` on the `whatsAppCtrl` object. This
   * function is likely intended to retrieve details related to a reply in a messaging application, such as WhatsApp.
   *
   * @async
   * @constant
   * @name getReplyToDetails
   */
  whatsAppCtrl.getReplyToDetails = async (
    { reply_to_original_event_id, wabaOwner },
    { transaction },
  ) => {
    const replyToChat = await whatsappChatCtrl.findOne(
      {
        original_event_id: reply_to_original_event_id,
      },
      { transaction },
    );
    const reply_to_content = replyToChat?.msg_body;
    const reply_to_msg_type = replyToChat?.msg_type;
    const reply_to_file_name = replyToChat?.file_name;
    const msg_info = replyToChat?.msg_info;
    let reply_to_contact_id;

    const agency_msg_types = [
      'frompave',
      'img_frompave',
      'video_frompave',
      'file_frompave',
    ];
    const contact_msg_types = [
      'image',
      'video',
      'file',
      'button',
      'text',
      'interactive',
    ];
    const contact_media_msg_type = ['image', 'video', 'file'];
    if (agency_msg_types.includes(replyToChat?.msg_type)) {
      const replyToChatAgentRecord = await agencyUserCtrl.findOne(
        { agency_user_id: replyToChat?.agency_user_fk },
        {
          include: {
            model: models.user,
            required: true,
          },
          transaction,
        },
      );
      reply_to_contact_id = replyToChatAgentRecord.user.first_name;
    }
    if (contact_msg_types.includes(replyToChat?.msg_type)) {
      const reply_to_receiver_number = replyToChat.receiver_number;
      const replyToChatContactRecord = await contactCtrl.findOne(
        {
          contact_id: replyToChat?.contact_fk,
          agency_fk: wabaOwner?.agency_fk,
        },
        { transaction },
      );
      reply_to_contact_id = replyToChatContactRecord?.first_name;
    }
    const replyToTracker = await whatsappMessageTrackerCtrl.findOne(
      {
        original_event_id: reply_to_original_event_id,
      },
      { transaction },
    );

    if (replyToTracker) {
      reply_to_contact_id = '';
    }

    return {
      reply_to_content,
      reply_to_contact_id,
      reply_to_msg_type,
      reply_to_file_name,
      msg_info,
    };
  };

  whatsAppCtrl.handleReplies = async ({
    msg_id,
    msg_type,
    original_event_id,
    msgData,
    media_url,
    media_msg_id,
    content_type,
    file_name,
    caption,
    msg_timestamp,
    sender_number,
    receiver_number,
    sender_url,
    receiver_url,
    reply_to_original_event_id,
    reply_to_mobile,
    agency_whatsapp_config_id,
    log,
    models,
    additionalConfig,
    transaction,
  }) => {
    try {
      let whatsapp_chat_id;

      log.info({
        function: 'handleReplies',
        msg_id,
        original_event_id,
      });

      const wabaOwner = await agencyWhatsAppConfigCtrl.findOne(
        {
          agency_whatsapp_config_id: agency_whatsapp_config_id,
        },
        { transaction },
      );

      const whatsappMsgTrackerForReplyUpdate =
        await whatsappMessageTrackerCtrl.findOne(
          {
            agency_fk: wabaOwner?.agency_fk,
            receiver_number,
            sender_number,
            tracker_type: 'main',
          },
          {
            order: [['created_date', 'DESC']],
            transaction,
          },
        );
      const contactRecord = await contactCtrl.findOne(
        {
          agency_fk: wabaOwner?.agency_fk,
          mobile_number: receiver_number,
        },
        { transaction },
      );

      log.info({
        data: 'whatsappMsgTrackerForReplyUpdate',
        whatsappMsgTrackerForReplyUpdate,
      });

      const replyEntrExists = await whatsappChatCtrl.findOne({
        original_event_id,
        msg_timestamp,
        msg_type: msg_type,
      });

      log.info({
        data: 'replyEntrExists',
        replyEntrExists,
      });

      // if there is a WABA found, reply not yet processed, has tracker record, and contact already exists
      if (
        wabaOwner &&
        !replyEntrExists &&
        whatsappMsgTrackerForReplyUpdate &&
        contactRecord
      ) {
        const replyMsg = msgData.trim();
        const sanitizedReplyMsg =
          h.general.sanitizeMaliciousAttributes(replyMsg);
        log.info({ contactRecord });

        const campaign_name = whatsappMsgTrackerForReplyUpdate?.campaign_name;

        let reply_to_content = null;
        let reply_to_contact_id = null;
        let reply_to_msg_type = null;
        let reply_to_file_name = null;
        if (!h.isEmpty(reply_to_original_event_id)) {
          const reply_data = await whatsAppCtrl.getReplyToDetails(
            {
              reply_to_original_event_id,
              wabaOwner,
            },
            { transaction },
          );
          reply_to_content = reply_data.reply_to_content;
          reply_to_contact_id = reply_data.reply_to_contact_id;
          reply_to_msg_type = reply_data.reply_to_msg_type;
          reply_to_file_name = reply_data.reply_to_file_name;
        }

        log.info({
          data: 'campaign_name',
          campaign_name,
        });

        const whatsAppChatData = {
          campaign_name: campaign_name,
          agency_fk: whatsappMsgTrackerForReplyUpdate?.agency_fk,
          contact_fk: contactRecord?.contact_id,
          agency_user_fk: contactRecord?.agency_user_fk,
          original_event_id,
          msg_id,
          msg_body: sanitizedReplyMsg,
          media_url,
          media_msg_id,
          content_type,
          file_name,
          caption,
          msg_type: msg_type,
          msg_timestamp,
          sender_number,
          sender_url,
          receiver_number,
          receiver_url,
          reply_to_event_id: reply_to_original_event_id,
          reply_to_content,
          reply_to_msg_type,
          reply_to_file_name,
          reply_to_contact_id,
          sent: 1,
          delivered: 1,
          read: 1,
          created_date: new Date(),
        };

        log.info({
          action: 'Saving whatsapp chat data',
          data: whatsAppChatData,
        });

        whatsapp_chat_id = await whatsappChatCtrl.create(whatsAppChatData, {
          transaction,
        });

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

        const appsync = await appSyncCredentialsCtrl.findOne({
          status: 'active',
        });
        const { api_key } = appsync;

        if (h.general.cmpInt(whatsappMsgTrackerForReplyUpdate?.read, 0)) {
          await whatsAppCtrl.handleContactActivity(
            { whatsappMsgTracker: whatsappMsgTrackerForReplyUpdate, log },
            { transaction },
          );
        }

        await whatsappMessageTrackerCtrl.update(
          whatsappMsgTrackerForReplyUpdate?.whatsapp_message_tracker_id,
          {
            read: h.general.cmpInt(whatsappMsgTrackerForReplyUpdate?.read, 0)
              ? 1
              : whatsappMsgTrackerForReplyUpdate?.read,
            replied: 1,
          },
          null,
          transaction,
        );

        let contactReplyMsg = replyMsg;
        contactReplyMsg = h.whatsapp.getContactReplyMessageLabel(
          contactReplyMsg,
          msg_type,
        );

        const sanitizedUnescapedValue =
          h.general.sanitizeMaliciousAttributes(contactReplyMsg);

        await models.unified_inbox.update(
          {
            tracker_id:
              whatsappMsgTrackerForReplyUpdate?.whatsapp_message_tracker_id,
            tracker_ref_name:
              whatsappMsgTrackerForReplyUpdate?.tracker_ref_name,
            campaign_name: whatsappMsgTrackerForReplyUpdate?.campaign_name,
            contact_fk: whatsappMsgTrackerForReplyUpdate?.contact_fk,
            sender: whatsappMsgTrackerForReplyUpdate?.sender_number,
            read: h.general.cmpInt(whatsappMsgTrackerForReplyUpdate?.read, 0)
              ? 1
              : whatsappMsgTrackerForReplyUpdate?.read,
            replied: 1,
            last_msg_date: new Date(),
            msg_type: msg_type,
            msg_id: whatsapp_chat_id,
            msg_body: sanitizedUnescapedValue,
            created_date: new Date(),
            updated_date: new Date(),
            tracker_type: 'main',
          },
          {
            where: {
              agency_fk: whatsappMsgTrackerForReplyUpdate?.agency_fk,
              receiver: whatsappMsgTrackerForReplyUpdate?.receiver_number,
              msg_platform: 'whatsapp',
            },
            transaction,
          },
        );

        if (
          !h.general.isEmpty(whatsappMsgTrackerForReplyUpdate?.sender_number) &&
          !h.general.isEmpty(whatsappMsgTrackerForReplyUpdate?.receiver_number)
        ) {
          await models.whatsapp_chat.update(
            {
              read: 1,
            },
            {
              where: {
                campaign_name: whatsappMsgTrackerForReplyUpdate?.campaign_name,
                sender_number: whatsappMsgTrackerForReplyUpdate?.sender_number,
                receiver_number:
                  whatsappMsgTrackerForReplyUpdate?.receiver_number,
                msg_type: 'frompave',
              },
              transaction,
            },
          );
        }

        const agency = await agencyCtrl.findOne(
          {
            agency_id: whatsappMsgTrackerForReplyUpdate?.agency_fk,
          },
          { transaction },
        );
        const agency_waba_config = await agencyWhatsAppConfigCtrl.findOne(
          {
            agency_fk: whatsappMsgTrackerForReplyUpdate?.agency_fk,
            waba_number: sender_number,
          },
          { transaction },
        );

        const { agency_whatsapp_api_token, agency_whatsapp_api_secret } =
          agency_waba_config;

        const api_credentials = Buffer.from(
          `${agency_whatsapp_api_token}:${agency_whatsapp_api_secret}`,
          'utf8',
        ).toString('base64');

        if (whatsappMsgTrackerForReplyUpdate) {
          await whatsappMessageTrackerCtrl.update(
            whatsappMsgTrackerForReplyUpdate.whatsapp_message_tracker_id,
            {
              sent: 1,
              delivered: 1,
              read: 1,
              sender_number,
              receiver_number,
              sender_url,
              receiver_url,
            },
            whatsappMsgTrackerForReplyUpdate.created_by,
            { transaction },
          );

          await models.unified_inbox.update(
            {
              tracker_id:
                whatsappMsgTrackerForReplyUpdate?.whatsapp_message_tracker_id,
              tracker_ref_name:
                whatsappMsgTrackerForReplyUpdate?.tracker_ref_name,
              campaign_name: whatsappMsgTrackerForReplyUpdate?.campaign_name,
              sender: whatsappMsgTrackerForReplyUpdate?.sender_number,
              read: h.general.cmpInt(whatsappMsgTrackerForReplyUpdate?.read, 0)
                ? 1
                : whatsappMsgTrackerForReplyUpdate?.read,
              replied: 1,
              last_msg_date: new Date(),
              msg_type: msg_type,
              msg_id: whatsapp_chat_id,
              msg_body: sanitizedUnescapedValue,
              created_date: new Date(),
              updated_date: new Date(),
              tracker_type: 'main',
            },
            {
              where: {
                agency_fk: whatsappMsgTrackerForReplyUpdate?.agency_fk,
                receiver: whatsappMsgTrackerForReplyUpdate?.receiver_number,
                msg_platform: 'whatsapp',
              },
              transaction,
            },
          );

          await h.appsync.sendGraphQLNotification(api_key, {
            position: 2,
            platform: 'whatsapp',
            campaign_name: campaign_name,
            agency_fk: whatsappMsgTrackerForReplyUpdate?.agency_fk,
            contact_fk: contactRecord?.contact_id,
            agency_user_fk: contactRecord?.agency_user_fk,
            original_event_id,
            msg_id: null,
            msg_body: sanitizedUnescapedValue,
            media_url,
            media_msg_id,
            content_type,
            file_name,
            caption,
            msg_type: msg_type,
            msg_timestamp,
            sender_number,
            sender_url,
            receiver_number,
            receiver_url,
            reply_to_event_id: reply_to_original_event_id,
            reply_to_content,
            reply_to_msg_type,
            reply_to_file_name,
            reply_to_contact_id,
            sent: 1,
            delivered: 1,
            read: 1,
            created_date_raw: new Date(),
            created_date: `${formattedDate} ${formattedTime}`,
          });

          let fullName = '';
          const firstName = contactRecord?.first_name;
          const lastName = contactRecord?.last_name;
          if (contactRecord.first_name && contactRecord.last_name) {
            fullName = contactRecord?.first_name.concat(
              ' ',
              contactRecord?.last_name,
            );
          } else if (contactRecord?.first_name) {
            fullName = contactRecord?.first_name;
          } else if (contactRecord?.last_name) {
            fullName = contactRecord?.last_name;
          } else {
            fullName = 'Contact';
          }

          const contact_source = await models.contact_source.findOne({
            where: {
              contact_fk: contactRecord?.contact_id,
              source_type: 'SALESFORCE',
            },
          });
          if (!h.isEmpty(contact_source)) {
            const agencyUser = await models.agency_user.findOne({
              where: {
                agency_user_id: contactRecord?.agency_user_fk,
              },
              include: [
                {
                  model: models.user,
                  required: true,
                },
                { model: models.agency, required: true },
              ],
            });

            const liveChatSettings = await models.live_chat_settings.findOne({
              where: {
                agency_fk: contactRecord?.agency_fk,
              },
            });
            const agencyOauth = await models.agency_oauth.findOne({
              where: {
                agency_fk: contactRecord?.agency_fk,
                status: 'active',
                source: 'SALESFORCE',
              },
            });
            const contactSalesforceData =
              await contactSalesforceDataCtrl.findOne(
                {
                  agency_fk: contactRecord?.agency_fk,
                  contact_fk: contactRecord?.contact_id,
                },
                {
                  order: [['created_date', 'DESC']],
                },
              );
            await h.salesforce.transmitMessage({
              liveChatSettings,
              contactSalesforceData,
              oauth: agencyOauth,
              contact: contactRecord,
              contact_source,
              currentAgencyUser: agencyUser,
              full_message_body: ['text', 'button'].includes(msg_type)
                ? replyMsg
                : media_url,
              messageType: msg_type,
              platform: 'whatsapp',
              log,
              encryptionKeys: additionalConfig.ek,
            });
            if (h.notEmpty(caption)) {
              await h.salesforce.transmitMessage({
                liveChatSettings,
                contactSalesforceData,
                oauth: agencyOauth,
                contact: contactRecord,
                contact_source,
                currentAgencyUser: agencyUser,
                full_message_body: caption,
                messageType: 'text',
                platform: 'whatsapp',
                log,
                encryptionKeys: additionalConfig.ek,
              });
            }
          }

          if (['text', 'interactive', 'button'].includes(msg_type)) {
            await whatsAppCtrl.handleAutoResponse(
              {
                replyMsg,
                whatsapp_message_tracker_id:
                  whatsappMsgTrackerForReplyUpdate.whatsapp_message_tracker_id,
                msg_timestamp,
                sender_number,
                sender_url,
                receiver_number,
                receiver_url,
                contactRecord,
                log,
                models,
                additionalConfig,
              },
              { transaction },
            );
          }

          const interactions = [
            'image',
            'video',
            'audio',
            'location',
            'document',
            'contact',
            'text',
            'interactive',
            'button',
          ];
          const tracker_name =
            whatsappMsgTrackerForReplyUpdate.tracker_ref_name;
          if (
            interactions.includes(msg_type) &&
            !tracker_name.includes('_user_message_')
          ) {
            const msgWithAgencyAndContact = await whatsappChatCtrl.findOne(
              {
                receiver_number,
                sender_number,
                agency_fk: {
                  [Op.not]: null,
                },
                contact_fk: {
                  [Op.not]: null,
                },
              },
              {
                order: [['created_date', 'DESC']],
                transaction,
              },
            );

            await models.whatsapp_chat.update(
              {
                campaign_name: campaign_name,
                agency_fk: msgWithAgencyAndContact.agency_fk,
                contact_fk: msgWithAgencyAndContact.contact_fk,
                agency_user_fk: contactRecord?.agency_user_fk,
              },
              {
                where: {
                  msg_id,
                  agency_fk: null,
                  contact_fk: null,
                },
                transaction,
              },
            );

            let send_email_notification = false;
            const { whatsapp_config } = await models.agency_config.findOne({
              where: { agency_fk: whatsappMsgTrackerForReplyUpdate?.agency_fk },
              transaction,
            });

            if (!h.isEmpty(whatsapp_config)) {
              const config = JSON.parse(whatsapp_config);
              const quick_replies = config.quick_replies;
              for (const qr of quick_replies) {
                if (
                  !h.cmpStr(qr.value, 'manual_reply') &&
                  (h.cmpStr(replyMsg.toLowerCase(), qr.value) ||
                    h.cmpStr(msg_type, 'text')) &&
                  h.cmpBool(qr.email, true)
                ) {
                  send_email_notification = true;
                }
              }
            }

            const media_interactions = [
              'image',
              'video',
              'audio',
              'location',
              'document',
              'contact',
            ];

            if (
              h.cmpBool(send_email_notification, true) ||
              media_interactions.includes(msg_type)
            ) {
              await whatsAppCtrl.handleMessageInteractionNotification(
                {
                  sender_number,
                  receiver_number,
                  campaign_name: campaign_name,
                  chat_id: whatsapp_chat_id,
                  contact_id: msgWithAgencyAndContact.contact_fk,
                  replyMsg,
                  msgType: msg_type,
                  msgOrigin: whatsappMsgTrackerForReplyUpdate?.agency_fk,
                  log,
                  models,
                },
                {
                  transaction,
                },
              );
            }
          }

          if (
            interactions.includes(msg_type) &&
            tracker_name.includes('_user_message_')
          ) {
            await whatsAppCtrl.handleUserMessageInteractionNotification(
              {
                sender_number,
                receiver_number,
                chat_id: whatsapp_chat_id,
                contact_id: whatsappMsgTrackerForReplyUpdate?.contact_fk,
                fullName,
                msgType: msg_type,
                replyMsg,
                agency_id: whatsappMsgTrackerForReplyUpdate?.agency_fk,
                agency_user_id:
                  whatsappMsgTrackerForReplyUpdate?.agency_user_fk,
                newMsg: false,
                log,
                models,
              },
              { transaction },
            );
          }
        }
      }

      // if waba exists, reply not yet processed and no tracker record
      if (wabaOwner && !replyEntrExists && !whatsappMsgTrackerForReplyUpdate) {
        const replyMsg = msgData.trim();
        const agencyWabaConfig = await agencyWhatsAppConfigCtrl.findOne(
          {
            agency_whatsapp_config_id: agency_whatsapp_config_id,
          },
          { transaction },
        );
        const agency = await agencyCtrl.findOne(
          {
            agency_id: agencyWabaConfig?.agency_fk,
          },
          { transaction },
        );
        const contact = await contactCtrl.findOne(
          {
            agency_fk: agencyWabaConfig?.agency_fk,
            mobile_number: receiver_number,
          },
          { transaction },
        );

        const agencyWhatsAppCredentials = h.notEmpty(
          agencyWabaConfig?.agency_whatsapp_api_token,
        )
          ? agencyWabaConfig?.agency_whatsapp_api_token +
            ':' +
            agencyWabaConfig?.agency_whatsapp_api_secret
          : null;
        if (!h.isEmpty(agencyWhatsAppCredentials)) {
          const { whatsapp_config } = await models.agency_config.findOne({
            where: { agency_fk: agencyWabaConfig?.agency_fk },
          });
          const config = JSON.parse(whatsapp_config);
          const environment = config.environment;
          const agencyBufferedCredentials = h.notEmpty(
            agencyWhatsAppCredentials,
          )
            ? Buffer.from(agencyWhatsAppCredentials, 'utf8').toString('base64')
            : null;

          const connectionData = JSON.stringify({
            uri: `${environment}://${receiver_number}@whatsapp.com`,
            name: `${receiver_number}`,
          });
          const connectionConfig = {
            method: 'post',
            url: 'https://apiv2.unificationengine.com/v2/connection/add',
            headers: {
              Authorization: `Basic ${agencyBufferedCredentials}`,
              'Content-Type': 'application/json',
            },
            data: connectionData,
          };

          const addConnectionResponse = await axios(connectionConfig)
            .then(function (response) {
              return response.data;
            })
            .catch(function (error) {
              return error;
            });
        }

        let contact_id = null;
        let agency_user_id = null;
        const broadcast_date = new Date();
        let fullName = '';
        let firstName = '';
        let lastName = '';
        let status = 'active';
        if (contact) {
          contact_id = contact?.contact_id;
          agency_user_id = contact?.agency_user_fk;
          const contactRecord = await contactCtrl.findOne({
            contact_id: contact_id,
            agency_fk: agencyWabaConfig?.agency_fk,
          });
          if (contactRecord.first_name && contactRecord.last_name) {
            fullName = contactRecord.first_name.concat(
              ' ',
              contactRecord.last_name,
            );
          } else if (contactRecord.first_name) {
            fullName = contactRecord.first_name;
          } else if (contactRecord.last_name) {
            fullName = contactRecord.last_name;
          } else {
            fullName = 'Contact';
          }
          firstName = contactRecord?.first_name;
          lastName = contactRecord?.last_name;
        } else {
          const whatsAppReceiverURL = new URL(receiver_url);
          const searchParams = new URLSearchParams(whatsAppReceiverURL.search);
          const whatsAppName = searchParams.get('name');
          let colorRandomKey;
          let objectRandomKey;
          let contactFirstName;
          let contactLastName;
          if (!h.isEmpty(whatsAppName)) {
            const firstSpaceIndex = whatsAppName.indexOf(' ');
            if (!h.cmpInt(firstSpaceIndex, -1)) {
              contactFirstName = whatsAppName.slice(0, firstSpaceIndex);
              contactLastName = whatsAppName.slice(firstSpaceIndex + 1);
            } else {
              contactFirstName = whatsAppName;
              contactLastName = null;
            }
            const tec_agencies = constant.TEC_AGENCIES;
            if (tec_agencies.includes(agencyWabaConfig?.agency_fk)) {
              contactLastName = h.isEmpty(contactLastName)
                ? '[No Last Name]'
                : contactLastName;
            }
          } else {
            const colors = constant.RANDOM_NAME.COLOR;
            const colorEntries = Object.entries(colors);
            const colorRandomIndex = Math.floor(
              Math.random() * colorEntries.length,
            );
            [colorRandomKey, contactFirstName] = colorEntries[colorRandomIndex];
            const objects = constant.RANDOM_NAME.OBJECT;
            const objectEntries = Object.entries(objects);
            const objectRandomIndex = Math.floor(
              Math.random() * objectEntries.length,
            );
            [objectRandomKey, contactLastName] =
              objectEntries[objectRandomIndex];
            status = 'outsider';
          }

          let contactOwnerDetails = null;
          let contactOwner = null;
          if (!h.isEmpty(agency?.default_outsider_contact_owner)) {
            contactOwner = agency?.default_outsider_contact_owner;
          } else {
            if (
              h.cmpStr(
                agencyWabaConfig?.agency_fk,
                '1f880948-0097-40a8-b431-978fd59ca321',
              )
            ) {
              contactOwnerDetails = await models.user.findOne({
                where: {
                  user_id: '5544d047-cf62-4f5f-9165-498869a68157',
                },
                include: [
                  {
                    model: models.agency_user,
                    where: {
                      agency_fk: agencyWabaConfig?.agency_fk,
                    },
                    include: [
                      {
                        model: models.agency,
                      },
                    ],
                  },
                ],
              });
            } else {
              contactOwnerDetails = await models.user.findOne({
                where: {
                  email: {
                    [Op.like]: `%support%`,
                  },
                },
                include: [
                  {
                    model: models.agency_user,
                    where: {
                      agency_fk: agencyWabaConfig?.agency_fk,
                    },
                    include: [
                      {
                        model: models.agency,
                      },
                    ],
                  },
                ],
              });
              contactOwner =
                contactOwnerDetails?.agency_user?.dataValues?.agency_user_id;
            }
          }
          fullName = contactFirstName + ' ' + contactLastName;
          agency_user_id = contactOwner;
          firstName = contactFirstName;
          lastName = contactLastName;

          contact_id = h.general.generateId();
          await models.contact.create({
            contact_id,
            first_name: contactFirstName,
            last_name: contactLastName,
            email: null,
            mobile_number: receiver_number,
            is_whatsapp: 0,
            agency_fk: agencyWabaConfig?.agency_fk,
            agency_user_fk: agency_user_id,
            // manual_label: agencyOauth ? 'sf_lead_contact' : null,
            from_export: false,
            status: status,
          });

          // @todo

          const contact_source_id = h.general.generateId();
          await models.contact_source.create(
            {
              contact_source_id,
              contact_fk: contact_id,
              source_contact_id: contact_id,
              source_type: 'WHATSAPP',
            },
            { transaction },
          );
        }
        const tracker_ref_name = `${Date.now()}_user_message_${agency?.agency_name
          .replaceAll(' ', '_')
          .toLowerCase()}`;
        const campaign_name = `${Date.now()} ${
          agency?.agency_name
        } ${contact_id}`;
        const whatsapp_message_tracker_id =
          await whatsappMessageTrackerCtrl.create(
            {
              campaign_name: campaign_name,
              campaign_name_label: campaign_name,
              tracker_ref_name,
              agency_fk: agencyWabaConfig?.agency_fk,
              contact_fk: contact_id,
              agency_user_fk: agency_user_id,
              original_event_id: original_event_id,
              tracker_type: 'main',
              msg_body: replyMsg,
              msg_origin: 'user',
              pending: false,
              failed: 0,
              sent: 1,
              delivered: 1,
              read: 1,
              replied: 1,
              batch_count: 1,
              sender_number: sender_number,
              receiver_number: receiver_number,
              sender_url: sender_url,
              receiver_url: receiver_url,
              visible: 0,
              created_by: null,
              broadcast_date: new Date(broadcast_date),
            },
            {
              transaction,
            },
          );
        whatsapp_chat_id = await whatsappChatCtrl.create(
          {
            campaign_name: campaign_name,
            agency_fk: agencyWabaConfig?.agency_fk,
            contact_fk: contact_id,
            agency_user_fk: agency_user_id,
            original_event_id,
            msg_id: null,
            msg_body: replyMsg,
            media_url,
            media_msg_id,
            content_type,
            file_name,
            caption,
            msg_type: msg_type,
            msg_timestamp,
            sender_number,
            sender_url,
            receiver_number,
            receiver_url,
            sent: 1,
            delivered: 1,
            read: 1,
            created_date: new Date(),
          },
          { transaction },
        );
        await unifiedInboxCtrl.create(
          {
            tracker_id: whatsapp_message_tracker_id,
            tracker_ref_name,
            campaign_name: campaign_name,
            agency_fk: agencyWabaConfig?.agency_fk,
            agency_user_fk: agency_user_id,
            contact_fk: contact_id,
            event_id: original_event_id,
            msg_id: whatsapp_chat_id,
            msg_body: replyMsg,
            msg_type: msg_type,
            msg_platform: 'whatsapp',
            tracker_type: 'main',
            pending: false,
            failed: 0,
            sent: 1,
            delivered: 1,
            read: 1,
            replied: 1,
            batch_count: 1,
            sender: sender_number,
            receiver: receiver_number,
            sender_url: sender_url,
            receiver_url: receiver_url,
            visible: 1,
            created_by: null,
            broadcast_date: new Date(broadcast_date),
            last_msg_date: new Date(broadcast_date),
          },
          {
            transaction,
          },
        );

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

        const appsync = await appSyncCredentialsCtrl.findOne({
          status: 'active',
        });
        const { api_key } = appsync;

        await whatsAppCtrl.handleUserMessageInteractionNotification(
          {
            sender_number,
            receiver_number,
            chat_id: whatsapp_chat_id,
            contact_id: contact_id,
            fullName,
            msgType: msg_type,
            replyMsg,
            agency_id: agencyWabaConfig?.agency_fk,
            agency_user_id,
            newMsg: true,
            log,
            models,
          },
          {
            transaction,
          },
        );
        log.info({
          message:
            '💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥 SEND APPSYNC NOTIFICATION START 💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥',
        });
        console.log(
          '💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥 SEND APPSYNC NOTIFICATION START 💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥',
        );

        await h.appsync.sendGraphQLNotification(api_key, {
          position: 3,
          platform: 'whatsapp',
          campaign_name: campaign_name,
          agency_fk: agencyWabaConfig?.agency_fk,
          contact_fk: contact_id,
          agency_user_fk: agency_user_id,
          original_event_id,
          msg_id: null,
          msg_body: replyMsg,
          media_url,
          media_msg_id,
          content_type,
          file_name,
          caption,
          msg_type: msg_type,
          msg_timestamp,
          sender_number,
          sender_url,
          receiver_number,
          receiver_url,
          reply_to_event_id: reply_to_original_event_id,
          reply_to_content: null,
          reply_to_msg_type: null,
          reply_to_file_name: null,
          reply_to_contact_id: null,
          sent: 1,
          delivered: 1,
          read: 1,
          created_date_raw: new Date(),
          created_date: `${formattedDate} ${formattedTime}`,
        });

        log.info({
          message:
            '💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥 SEND APPSYNC NOTIFICATION ENDED 💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥',
        });
        console.log(
          '💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥 SEND APPSYNC NOTIFICATION ENDED 💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥',
        );
        log.info({
          message: 'running integration handleSalesforceIntegration',
        });
        console.log('running integration handleSalesforceIntegration');

        const contactRecord = await contactCtrl.findOne({
          contact_id: contact_id,
          agency_fk: agencyWabaConfig?.agency_fk,
        });
        log.info({ contactRecord });
        const contact_source = await models.contact_source.findOne({
          where: {
            contact_fk: contactRecord?.contact_id,
            source_type: 'SALESFORCE',
          },
        });
        if (!h.isEmpty(contact_source)) {
          const agencyUser = await models.agency_user.findOne({
            where: {
              agency_user_id: contactRecord?.agency_user_fk,
            },
            include: [
              {
                model: models.user,
                required: true,
              },
              { model: models.agency, required: true },
            ],
          });
          const liveChatSettings = await models.live_chat_settings.findOne({
            where: {
              agency_fk: contactRecord?.agency_fk,
            },
          });
          const agencyOauth = await models.agency_oauth.findOne({
            where: {
              agency_fk: contactRecord?.agency_fk,
              status: 'active',
              source: 'SALESFORCE',
            },
          });
          const contactSalesforceData = await contactSalesforceDataCtrl.findOne(
            {
              agency_fk: contactRecord?.agency_fk,
              contact_fk: contactRecord?.contact_id,
            },
            {
              order: [['created_date', 'DESC']],
            },
          );
          await h.salesforce.transmitMessage({
            liveChatSettings,
            contactSalesforceData,
            oauth: agencyOauth,
            contact: contactRecord,
            contact_source,
            currentAgencyUser: agencyUser,
            full_message_body: ['text', 'button'].includes(msg_type)
              ? replyMsg
              : media_url,
            messageType: msg_type,
            platform: 'whatsapp',
            log,
            encryptionKeys: additionalConfig.ek,
          });

          if (h.notEmpty(caption)) {
            await h.salesforce.transmitMessage({
              liveChatSettings,
              contactSalesforceData,
              oauth: agencyOauth,
              contact: contactRecord,
              contact_source,
              currentAgencyUser: agencyUser,
              full_message_body: caption,
              messageType: 'text',
              platform: 'whatsapp',
              log,
              encryptionKeys: additionalConfig.ek,
            });
          }
        }

        // send initial trial message when new contact and sent message in trial number
        if (h.cmpBool(agencyWabaConfig?.trial_number_to_use, true)) {
          await whatsAppCtrl.sendTrialMessage(
            {
              wabaOwner,
              contactRecord,
              sender_number,
              sender_url,
              receiver_number,
              receiver_url,
              campaign_name,
              whatsapp_message_tracker_id,
              tracker_ref_name,
              log,
              additionalConfig,
            },
            { transaction },
          );
        }
      }
    } catch (err) {
      log.error({ action: 'handleReplies', err });
      throw new Error('handle replies error');
    }
  };

  /**
   * The above code snippet is defining an asynchronous function called `handleAutoResponse` within an object named
   * `whatsAppCtrl`. The function is for handling auto response sending
   * @async
   * @constant
   * @name handleAutoResponse
   */
  whatsAppCtrl.handleAutoResponse = async ({
    replyMsg,
    whatsapp_message_tracker_id,
    msg_timestamp,
    sender_number,
    sender_url,
    receiver_number,
    receiver_url,
    contactRecord,
    log,
    models,
    additionalConfig,
    transaction,
  }) => {
    let whatsapp_chat_id;
    const whatsappMsgTrackerForReplyUpdate =
      await whatsappMessageTrackerCtrl.findOne(
        {
          contact_fk: contactRecord?.contact_id,
          receiver_number,
          sender_number,
          tracker_type: 'main',
        },
        {
          order: [['created_date', 'DESC']],
          transaction,
        },
      );

    let send_reply = false;
    let opt_out = false;
    const parts = [];
    let response = '';

    const [agency, contact, agency_waba_config] = await Promise.all([
      agencyCtrl.findOne({
        agency_id: whatsappMsgTrackerForReplyUpdate?.agency_fk,
      }),
      contactCtrl.findOne({
        contact_id: whatsappMsgTrackerForReplyUpdate?.contact_fk,
        agency_fk: contactRecord?.agency_fk,
      }),
      agencyWhatsAppConfigCtrl.findOne({
        agency_fk: whatsappMsgTrackerForReplyUpdate?.agency_fk,
        waba_number: sender_number,
      }),
    ]);

    const { agency_whatsapp_api_token, agency_whatsapp_api_secret } =
      agency_waba_config;

    const api_credentials = Buffer.from(
      `${agency_whatsapp_api_token}:${agency_whatsapp_api_secret}`,
      'utf8',
    ).toString('base64');

    const receivers = [
      {
        name: 'name',
        address: `${receiver_number}`,
        Connector: `${receiver_number}`,
        type: 'individual',
      },
    ];

    const { whatsapp_config } = await models.agency_config.findOne({
      where: { agency_fk: whatsappMsgTrackerForReplyUpdate?.agency_fk },
      transaction,
    });

    const has_additional = false;
    const additional_id = null;

    const campaign_cta = await models.campaign_cta.findOne({
      where: {
        campaign_tracker_ref_name:
          whatsappMsgTrackerForReplyUpdate?.tracker_ref_name,
      },
      transaction,
    });

    if (h.notEmpty(campaign_cta)) {
      log.info({
        message: 'checking if reply has text autoresponse',
        reply: replyMsg,
      });

      let msg_response = '';
      let index;
      for (index = 1; index <= 10; index++) {
        if (
          h.cmpStr(campaign_cta[`cta_${index}`], replyMsg.toLowerCase()) &&
          h.notEmpty(campaign_cta[`cta_${index}_response`])
        ) {
          msg_response = campaign_cta[`cta_${index}_response`];
          send_reply = true;
          break;
        }
      }

      log.info({
        reply: replyMsg,
        response: msg_response,
        send_reply: send_reply,
        has_additional: has_additional,
      });
      response = msg_response;
      opt_out = false;

      /**
       * Create activity log
       */
      try {
        const contactActivityData = {
          activity_type: null,
          activity_meta: '',
          activity_ip: null,
          viewed_on_device: 'Mobile',
          activity_date: h.date.getSqlCurrentDate(),
          created_by: whatsappMsgTrackerForReplyUpdate?.contact_fk,
          contact_fk: whatsappMsgTrackerForReplyUpdate?.contact_fk,
        };

        // check buttons not confirmation campaign
        for (let i = 1; i <= 10; i++) {
          if (
            h.cmpInt(index, i) &&
            h.cmpBool(campaign_cta?.is_confirmation, false)
          ) {
            contactActivityData.activity_type =
              constant.CONTACT.ACTIVITY.TYPE[`CLICKED_ON_WA_BTN_${i}`];
          }
        }

        if (contactActivityData.activity_type) {
          await h.database.transaction(async (transaction) => {
            await contactActivityCtrl.create(contactActivityData, {
              transaction,
            });
          });
        }
      } catch (error) {
        log.info({
          message: '💥💥💥💥💥CONTACT ACTIVITY ERROR💥💥💥💥💥',
        });
        console.log('💥💥💥💥💥CONTACT ACTIVITY ERROR💥💥💥💥💥');
        log.error({ error: error });
        log.info({
          message: 'r💥💥💥💥💥END ERROR💥💥💥💥💥',
        });
        console.log('💥💥💥💥💥END ERROR💥💥💥💥💥');
      }
    } else {
      if (h.cmpStr(replyMsg.toLowerCase(), 'opt me out')) {
        response =
          'Noted, we will not be sending you updates via our company WhatsApp account going forward.';
        send_reply = true;
        opt_out = true;
        log.info({
          reply: replyMsg,
          response: response,
          send_reply: send_reply,
          opt_out: opt_out,
        });
      }
      if (h.cmpStr(replyMsg.toLowerCase(), "i'm available")) {
        response = 'Great, we will be in touch shortly.';
        send_reply = true;
        opt_out = false;
        log.info({
          reply: replyMsg,
          response: response,
          send_reply: send_reply,
          opt_out: opt_out,
        });
      }
      if (h.cmpStr(replyMsg.toLowerCase(), 'not looking')) {
        response = 'Ok, thanks for letting us know.';
        send_reply = true;
        opt_out = false;
        log.info({
          reply: replyMsg,
          response: response,
          send_reply: send_reply,
          opt_out: opt_out,
        });
      }
      if (h.cmpStr(replyMsg.toLowerCase(), 'this one not for me')) {
        response = 'Ok, thanks for letting us know.';
        send_reply = true;
        opt_out = false;
        log.info({
          reply: replyMsg,
          response: response,
          send_reply: send_reply,
          opt_out: opt_out,
        });
      }
    }

    if (h.cmpStr(replyMsg.toLowerCase(), 'unsubscribe')) {
      opt_out = true;
    }

    const optOutTextRecords = await unsubscribeTextCtrl.findAll(
      { agency_fk: whatsappMsgTrackerForReplyUpdate?.agency_fk },
      {
        transaction,
      },
    );

    const optOutTexts = optOutTextRecords.map((m) => {
      return m.content.toLowerCase();
    });

    log.info({
      message: 'OPT OUT TEXTS',
      optOutTexts,
    });
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!OPT OUT TEXTS', optOutTexts);
    if (optOutTexts.includes(replyMsg.toLowerCase())) {
      opt_out = true;
    }

    if (h.cmpBool(opt_out, true)) {
      try {
        await models.contact.update(
          {
            opt_out_whatsapp: 1,
            opt_out_whatsapp_date: h.date.getSqlCurrentDate(),
          },
          {
            where: {
              contact_id: whatsappMsgTrackerForReplyUpdate?.contact_fk,
            },
            transaction,
          },
        );
      } catch (optOutWhatsAppErr) {
        log.error({
          action: 'WHATSAPP MESSAGE OPT OUT ERROR',
          response: optOutWhatsAppErr,
        });
        throw new Error('WHATSAPP MESSAGE OPT OUT ERROR');
      }
      log.info({
        action: 'opt out contact from whatsapp proposal messages',
        mobile_number: receiver_number,
      });
    }

    log.info({
      checking_response: 'checking for text response',
      send_reply: send_reply,
      has_additional: has_additional,
      response: response,
    });

    // auto response when no additional triggers
    if (h.cmpBool(send_reply, true) && !h.isEmpty(response)) {
      parts.push({
        id: '1',
        contentType: 'text/plain',
        data: `${response}`,
        size: 1000,
        type: 'body',
        sort: 0,
      });

      log.info({
        action: 'sending text auto response',
        data: {
          mobile_number: receiver_number,
          parts,
          receivers,
          api_credentials,
        },
      });

      const config = JSON.parse(whatsapp_config);
      const environment = config.environment;

      const canContinueAutomationSending =
        await messageInventory.checkIfCanSendMessage(
          contactRecord?.agency_fk,
          null,
          log,
        );

      let result;
      let failed_reason = null;
      if (h.cmpBool(canContinueAutomationSending.can_continue, false)) {
        result = { original_event_id: null };
        const reason = h.general.getMessageByCode(
          canContinueAutomationSending.reason,
        );
        failed_reason = JSON.stringify([{ code: 100000, title: reason }]);
      } else {
        result = await h.whatsapp.sendAutoResponseMessage({
          mobile_number: receiver_number,
          parts,
          receivers,
          api_credentials,
          environment,
          log,
        });
      }

      const sanitizedResponse = h.general.sanitizeMaliciousAttributes(response);

      whatsapp_chat_id = await whatsappChatCtrl.create(
        {
          campaign_name: whatsappMsgTrackerForReplyUpdate?.campaign_name,
          msg_id: whatsappMsgTrackerForReplyUpdate?.whatsapp_message_tracker_id,
          msg_timestamp,
          sender_number,
          sender_url,
          receiver_number,
          receiver_url: receiver_url.split('?')[0],
          agency_fk: agency.dataValues.agency_id,
          agency_user_fk: contactRecord?.agency_user_fk,
          contact_fk: contact.dataValues.contact_id,
          original_event_id: result?.original_event_id,
          failed: h.isEmpty(result?.original_event_id),
          failed_reason,
          sent: h.notEmpty(result?.original_event_id),
          msg_type: 'frompave',
          msg_body: `${sanitizedResponse}`,
        },
        { transaction },
      );
      await models.unified_inbox.update(
        {
          created_date: new Date(),
          updated_date: new Date(),
          last_msg_date: new Date(),
          msg_id: whatsapp_chat_id,
          msg_type: 'frompave',
          msg_body: `${sanitizedResponse}`,
        },
        {
          where: {
            tracker_id:
              whatsappMsgTrackerForReplyUpdate?.whatsapp_message_tracker_id,
            msg_platform: 'whatsapp',
          },
          transaction,
        },
      );

      const appsync = await appSyncCredentialsCtrl.findOne({
        status: 'active',
      });
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
      log.info({ message: 'with auto response' });
      console.log('with auto response');
      await h.appsync.sendGraphQLNotification(api_key, {
        position: 4,
        platform: 'whatsapp',
        campaign_name: whatsappMsgTrackerForReplyUpdate?.campaign_name,
        agency_fk: whatsappMsgTrackerForReplyUpdate?.agency_fk,
        contact_fk: contactRecord?.contact_id,
        agency_user_fk: contactRecord?.agency_user_fk,
        msg_id: null,
        msg_body: `${sanitizedResponse}`,
        media_url: null,
        media_msg_id: null,
        content_type: null,
        file_name: null,
        caption: null,
        msg_type: 'frompave',
        msg_timestamp,
        sender_number,
        sender_url,
        receiver_number,
        receiver_url: null,
        reply_to_event_id: null,
        reply_to_content: null,
        reply_to_msg_type: null,
        reply_to_file_name: null,
        reply_to_contact_id: null,
        original_event_id: result?.original_event_id,
        failed: h.isEmpty(result?.original_event_id),
        failed_reason,
        sent: h.notEmpty(result?.original_event_id),
        delivered: 0,
        read: 0,
        created_date_raw: new Date(),
        created_date: `${formattedDate} ${formattedTime}`,
      });

      if (h.notEmpty(result.original_event_id)) {
        await messageInventory.addMessageCount(
          whatsappMsgTrackerForReplyUpdate?.agency_fk,
        );
        await agencyNotification.checkMessageCapacityAfterUpdate(
          whatsappMsgTrackerForReplyUpdate?.agency_fk,
        );

        const contact_source = await models.contact_source.findOne({
          where: {
            contact_fk: contactRecord?.contact_id,
            source_type: 'SALESFORCE',
          },
        });
        if (!h.isEmpty(contact_source)) {
          const agencyUser = await models.agency_user.findOne({
            where: {
              agency_user_id: contactRecord?.agency_user_fk,
            },
            include: [
              {
                model: models.user,
                required: true,
              },
              { model: models.agency, required: true },
            ],
          });

          const liveChatSettings = await models.live_chat_settings.findOne({
            where: {
              agency_fk: contactRecord?.agency_fk,
            },
          });
          const agencyOauth = await models.agency_oauth.findOne({
            where: {
              agency_fk: contactRecord?.agency_fk,
              status: 'active',
              source: 'SALESFORCE',
            },
          });
          const contactSalesforceData = await contactSalesforceDataCtrl.findOne(
            {
              agency_fk: contactRecord?.agency_fk,
              contact_fk: contactRecord?.contact_id,
            },
            {
              order: [['created_date', 'DESC']],
            },
          );
          await h.salesforce.transmitMessage({
            liveChatSettings,
            contactSalesforceData,
            oauth: agencyOauth,
            contact: contactRecord,
            contact_source,
            currentAgencyUser: agencyUser,
            full_message_body: response,
            messageType: 'plain_frompave',
            platform: 'whatsapp',
            log,
            encryptionKeys: additionalConfig.ek,
          });
        }
      }
    }

    // if no simple auto response
    if (
      h.notEmpty(campaign_cta) &&
      h.cmpBool(send_reply, false) &&
      h.isEmpty(response)
    ) {
      log.info({
        message: 'checking if reply has template autoresponse',
        reply: replyMsg,
      });

      let send_trigger_response = false;
      let followup_template_id = null;
      let cta_number = '';
      for (let i = 1; i <= 10; i++) {
        const cta = campaign_cta[`cta_${i}`];
        if (!h.isEmpty(cta)) {
          if (h.cmpStr(replyMsg.toLowerCase(), cta.toLowerCase())) {
            if (!h.isEmpty(campaign_cta[`trigger_cta_${i}_options`])) {
              followup_template_id = campaign_cta[`trigger_cta_${i}_options`];
              send_trigger_response = true;
              cta_number = i;
              break;
            }
          }
        }
      }

      log.info({
        checking_response: 'checking template response',
        send_trigger_response: send_trigger_response,
        followup_template_id: followup_template_id,
        cta_number,
      });

      if (h.cmpBool(send_trigger_response, true)) {
        const followup_template = await models.waba_template.findOne({
          where: {
            waba_template_id: followup_template_id,
          },
        });
        const variable = followup_template?.variable_identifier;
        const variable_arr = h.isEmpty(variable) ? [] : variable.split(',');
        const template = JSON.parse(followup_template?.content);
        let msg_body = '';

        const messageParts = [];
        const messageTemplate = {
          id: '1',
          contentType: 'text/html',
          data: '',
          header: [],
          body: [],
          button: [],
          size: 1000,
          type: 'template',
          sort: 0,
        };

        template.components.forEach((component) => {
          if (h.cmpStr(component.type, 'HEADER')) {
            if (['IMAGE', 'VIDEO'].includes(component.format)) {
              const filename =
                followup_template.header_image &&
                followup_template.header_image.substring(
                  followup_template.header_image.lastIndexOf('/') + 1,
                );
              if (['IMAGE'].includes(component.format)) {
                messageTemplate.header.push({
                  type: 'image',
                  image: {
                    link: followup_template.header_image,
                    filename: filename,
                  },
                });
              }
              if (['VIDEO'].includes(component.format)) {
                messageTemplate.header.push({
                  type: 'video',
                  video: {
                    link: followup_template.header_image,
                    filename: filename,
                  },
                });
              }
            }
          }
          if (h.cmpStr(component.type, 'BODY')) {
            if (
              followup_template.header_image &&
              !h.cmpStr(
                followup_template.header_image,
                'https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/image-placeholder.png',
              )
            ) {
              template.components.forEach((component) => {
                if (h.cmpStr(component.type, 'HEADER')) {
                  if (['IMAGE'].includes(component.format)) {
                    msg_body += `<img src="${followup_template.header_image}" class="campaign_header_image" style="width: 100%; margin-bottom: 20px;">`;
                  }
                  if (['VIDEO'].includes(component.format)) {
                    msg_body += `<video class="campaign_header_image" style="width: 100%; margin-bottom: 20px;" controls src="${followup_template.header_image}"></video>`;
                  }
                }
              });
            }

            msg_body += component.text;
            if (typeof component.example !== 'undefined') {
              const examples =
                component.example.body_text.length > 0
                  ? component.example.body_text[0]
                  : [];
              examples.forEach((ex, index) => {
                let component_value = null;
                if (variable_arr.length > 0) {
                  if (variable_arr[index] === 'agency') {
                    component_value = h.general.prettifyConstant(
                      agency?.agency_name,
                    );
                  } else if (variable_arr[index] === 'agent') {
                    component_value = h.general.prettifyConstant(
                      contactAgencyUser.user.first_name,
                    );
                  } else {
                    component_value = contact?.first_name || receiver_number;
                  }
                  messageTemplate.body.push({
                    type: 'text',
                    text: `${component_value}`,
                  });
                  msg_body = msg_body.replace(
                    `{{${index + 1}}}`,
                    component_value,
                  );
                } else {
                  msg_body = msg_body.replace(
                    `{{${index + 1}}}`,
                    contact?.first_name || receiver_number,
                  );
                }
              });
            }
          }

          const permalink_url = h.cmpStr(process.env.NODE_ENV, 'development')
            ? 'https://samplerealestateagency.yourpave.com/Samplerealestateagency-Proposal-for-IAN-gzc72sna'
            : contact?.permalink;

          if (h.cmpStr(component.type, 'BUTTONS')) {
            component.buttons.forEach((btn, index) => {
              if (h.cmpStr(btn.type, 'URL') && btn.url.includes('{{1}}')) {
                let dynamic_url_params;
                const sample = btn.example[0];
                if (sample.includes('sample_email@domain.com')) {
                  if (
                    [
                      '8b09a1a1-0a8f-4aed-ac56-d3a0244a8d47',
                      '36f64032-bdf9-4cdc-b980-cdcdec944fb8',
                    ].includes(followup_template?.agency_fk)
                  ) {
                    const dynamic_url_params = `?referred_by=${contact?.email}`;
                    messageTemplate.button.push({
                      sub_type: 'url',
                      parameters: [{ type: 'text', text: dynamic_url_params }],
                    });
                  } else {
                    const dynamic_url_params = contact?.email;
                    messageTemplate.button.push({
                      sub_type: 'url',
                      parameters: [{ type: 'text', text: dynamic_url_params }],
                    });
                  }
                } else {
                  dynamic_url_params = permalink_url.substring(
                    permalink_url.lastIndexOf('/') + 1,
                  );
                  messageTemplate.button.push({
                    sub_type: 'url',
                    parameters: [{ type: 'text', text: dynamic_url_params }],
                  });
                }
              }
              msg_body += `<button type="button" style="display:block; margin-top: 10px; margin-bottom: 10px; width: 100%; border: 1px solid #171717; border-radius: 10px; background-color: #ffffff; color: #313131;" class="header-none-btn " disabled>${btn.text}</button>`;
            });
          }
        });

        const contactAgencyUser = await models.agency_user.findOne({
          where: {
            agency_user_id: contact?.agency_user_fk,
          },
          include: [{ model: models.user, required: true }],
        });

        const body = messageTemplate.body;
        const header = messageTemplate.header;
        const button = messageTemplate.button;

        messageTemplate.data = JSON.stringify({
          element_name: followup_template.template_name,
          language: followup_template.language,
          header: header,
          body: body,
          button: button,
        });
        delete messageTemplate.body;
        delete messageTemplate.header;
        delete messageTemplate.button;
        messageParts.push(messageTemplate);

        const config = JSON.parse(whatsapp_config);
        const environment = config.environment;

        const sendMessagePartsData = {
          message: {
            receivers: [
              {
                name: 'name',
                address: `${receiver_number}`,
                Connector: `${receiver_number}`,
                type: 'individual',
              },
            ],
            parts: messageParts,
          },
        };

        log.info({ sendMessagePartsData });

        const canContinueAutomationSending =
          await messageInventory.checkIfCanSendMessage(
            contactRecord?.agency_fk,
            null,
            log,
          );

        let sendWhatsAppTemplateMessageResponse;
        let failed_reason = null;

        if (h.cmpBool(canContinueAutomationSending.can_continue, false)) {
          sendWhatsAppTemplateMessageResponse = { original_event_id: null };
          const reason = h.general.getMessageByCode(
            canContinueAutomationSending.reason,
          );
          failed_reason = JSON.stringify([{ code: 100000, title: reason }]);
        } else {
          sendWhatsAppTemplateMessageResponse =
            await h.whatsapp.sendWhatsAppTemplateMessage(
              receiver_number,
              true,
              null,
              sendMessagePartsData,
              api_credentials,
              environment,
              log,
            );
        }

        const sanitizedMessageBody =
          h.general.sanitizeMaliciousAttributes(msg_body);
        whatsapp_chat_id = await whatsappChatCtrl.create(
          {
            campaign_name: whatsappMsgTrackerForReplyUpdate?.campaign_name,
            msg_id: `followup ${cta_number}`,
            msg_timestamp,
            sender_number,
            sender_url,
            receiver_number,
            receiver_url: receiver_url.split('?')[0],
            agency_fk: agency.agency_id,
            agency_user_fk: contact?.agency_user_fk,
            contact_fk: contact?.contact_id,
            original_event_id:
              sendWhatsAppTemplateMessageResponse?.original_event_id,
            failed: h.isEmpty(
              sendWhatsAppTemplateMessageResponse?.original_event_id,
            ),
            failed_reason,
            sent: h.notEmpty(
              sendWhatsAppTemplateMessageResponse?.original_event_id,
            ),
            msg_type: 'frompave',
            msg_body: `${sanitizedMessageBody}`,
          },
          { transaction },
        );
        await models.unified_inbox.update(
          {
            created_date: new Date(),
            updated_date: new Date(),
            msg_id: whatsapp_chat_id,
            msg_type: 'frompave',
            last_msg_date: new Date(),
            msg_body: `${sanitizedMessageBody}`,
          },
          {
            where: {
              tracker_id:
                whatsappMsgTrackerForReplyUpdate?.whatsapp_message_tracker_id,
              msg_platform: 'whatsapp',
            },
            transaction,
          },
        );

        const appsync = await appSyncCredentialsCtrl.findOne({
          status: 'active',
        });
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

        await h.appsync.sendGraphQLNotification(api_key, {
          position: 5,
          platform: 'whatsapp',
          campaign_name: whatsappMsgTrackerForReplyUpdate?.campaign_name,
          agency_fk: whatsappMsgTrackerForReplyUpdate?.agency_fk,
          contact_fk: contact?.contact_id,
          agency_user_fk: contact?.agency_user_fk,
          msg_id: null,
          msg_body: `${sanitizedMessageBody}`,
          media_url: null,
          media_msg_id: null,
          content_type: null,
          file_name: null,
          caption: null,
          msg_type: 'frompave',
          msg_timestamp,
          sender_number,
          sender_url,
          receiver_number,
          receiver_url: null,
          reply_to_event_id: null,
          reply_to_content: null,
          reply_to_msg_type: null,
          reply_to_file_name: null,
          reply_to_contact_id: null,
          delivered: 0,
          read: 0,
          original_event_id:
            sendWhatsAppTemplateMessageResponse?.original_event_id,
          failed: h.isEmpty(
            sendWhatsAppTemplateMessageResponse?.original_event_id,
          ),
          failed_reason,
          sent: h.notEmpty(
            sendWhatsAppTemplateMessageResponse?.original_event_id,
          ),
          created_date_raw: new Date(),
          created_date: `${formattedDate} ${formattedTime}`,
        });

        if (h.notEmpty(sendWhatsAppTemplateMessageResponse.original_event_id)) {
          await messageInventory.addMessageCount(agency?.agency_id);
          await agencyNotification.checkMessageCapacityAfterUpdate(
            agency?.agency_id,
          );

          const contact_source = await models.contact_source.findOne({
            where: {
              contact_fk: contact?.contact_id,
              source_type: 'SALESFORCE',
            },
          });
          if (!h.isEmpty(contact_source)) {
            const agencyUser = await models.agency_user.findOne({
              where: {
                agency_user_id: contact?.agency_user_fk,
              },
              include: [
                {
                  model: models.user,
                  required: true,
                },
                { model: models.agency, required: true },
              ],
            });

            const liveChatSettings = await models.live_chat_settings.findOne({
              where: {
                agency_fk: contact?.agency_fk,
              },
            });
            const agencyOauth = await models.agency_oauth.findOne({
              where: {
                agency_fk: contact?.agency_fk,
                status: 'active',
                source: 'SALESFORCE',
              },
            });
            const contactSalesforceData =
              await contactSalesforceDataCtrl.findOne(
                {
                  agency_fk: contact?.agency_fk,
                  contact_fk: contact?.contact_id,
                },
                {
                  order: [['created_date', 'DESC']],
                },
              );
            await h.salesforce.transmitMessage({
              liveChatSettings,
              contactSalesforceData,
              oauth: agencyOauth,
              contact,
              contact_source,
              currentAgencyUser: agencyUser,
              full_message_body: msg_body,
              messageType: 'template',
              platform: 'whatsapp',
              log,
              encryptionKeys: additionalConfig.ek,
            });
          }
        }
      }
    }

    const latestPaveMessage = await whatsappChatCtrl.findOne(
      {
        campaign_name: whatsappMsgTrackerForReplyUpdate?.campaign_name,
        sender_number,
        receiver_number,
        msg_id: {
          [Op.like]: 'followup%',
        },
      },
      {
        order: [['created_date', 'DESC']],
        transaction,
      },
    );

    if (!h.isEmpty(latestPaveMessage)) {
      const followup_mark = latestPaveMessage?.dataValues?.msg_id;
      const response_mark = followup_mark.split(' ')[1];
      log.info({ message: 'response mark', response_mark });
      log.info({ campaign_cta });
      let send_final_response = false;
      let final_response = '';
      let previous_template_id = null;
      const followup_buttons = [];
      for (let i = 1; i <= 10; i++) {
        if (
          h.cmpInt(response_mark, i) &&
          !h.isEmpty(campaign_cta[`cta_${i}_final_response`])
        ) {
          final_response = campaign_cta[`cta_${i}_final_response`];
          previous_template_id = campaign_cta[`trigger_cta_${i}_options`];
        }
      }

      if (!h.isEmpty(previous_template_id)) {
        log.info({
          message: 'getting previous followup template',
          previous_template_id,
        });
        const prev_followup_template = await models.waba_template.findOne({
          where: {
            waba_template_id: previous_template_id,
          },
        });
        const template = JSON.parse(prev_followup_template?.content);
        template.components.forEach((component) => {
          if (h.cmpStr(component.type, 'BUTTONS')) {
            component.buttons.forEach((btn, index) => {
              if (h.cmpStr(btn.type, 'QUICK_REPLY')) {
                followup_buttons.push(btn.text);
              }
            });
          }
        });

        send_final_response = true;
      }

      if (h.cmpBool(send_final_response, true)) {
        const parts = [];
        parts.push({
          id: '1',
          contentType: 'text/plain',
          data: `${final_response}`,
          size: 1000,
          type: 'body',
          sort: 0,
        });

        log.info({
          action: 'sending final response',
          data: {
            mobile_number: receiver_number,
            parts,
            receivers,
            api_credentials,
          },
        });

        const config = JSON.parse(whatsapp_config);
        const environment = config.environment;

        const canContinueAutomationSending =
          await messageInventory.checkIfCanSendMessage(
            contactRecord?.agency_fk,
            null,
            log,
          );

        let result;
        let failed_reason = null;
        if (h.cmpBool(canContinueAutomationSending.can_continue, false)) {
          result = { original_event_id: null };
          const reason = h.general.getMessageByCode(
            canContinueAutomationSending.reason,
          );
          failed_reason = JSON.stringify([{ code: 100000, title: reason }]);
        } else {
          result = await h.whatsapp.sendAutoResponseMessage({
            mobile_number: receiver_number,
            parts,
            receivers,
            api_credentials,
            environment,
            log,
          });
        }
        const sanitizedFinalResponse =
          h.general.sanitizeMaliciousAttributes(final_response);
        whatsapp_chat_id = await whatsappChatCtrl.create(
          {
            campaign_name: whatsappMsgTrackerForReplyUpdate?.campaign_name,
            msg_id:
              whatsappMsgTrackerForReplyUpdate?.whatsapp_message_tracker_id,
            msg_timestamp,
            sender_number,
            sender_url,
            receiver_number,
            receiver_url: receiver_url.split('?')[0],
            agency_fk: agency.dataValues.agency_id,
            agency_user_fk: contactRecord?.agency_user_fk,
            contact_fk: contact.dataValues.contact_id,
            msg_type: 'frompave',
            msg_body: `${sanitizedFinalResponse}`,
            original_event_id: result?.original_event_id,
            failed: h.isEmpty(result?.original_event_id),
            failed_reason,
            sent: h.notEmpty(result?.original_event_id),
          },
          { transaction },
        );
        await models.unified_inbox.update(
          {
            created_date: new Date(),
            updated_date: new Date(),
            last_msg_date: new Date(),
            msg_id: whatsapp_chat_id,
            msg_type: 'frompave',
            msg_body: `${sanitizedFinalResponse}`,
          },
          {
            where: {
              tracker_id:
                whatsappMsgTrackerForReplyUpdate?.whatsapp_message_tracker_id,
              msg_platform: 'whatsapp',
            },
            transaction,
          },
        );

        const appsync = await appSyncCredentialsCtrl.findOne({
          status: 'active',
        });
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

        await h.appsync.sendGraphQLNotification(api_key, {
          position: 6,
          platform: 'whatsapp',
          campaign_name: whatsappMsgTrackerForReplyUpdate?.campaign_name,
          agency_fk: whatsappMsgTrackerForReplyUpdate?.agency_fk,
          contact_fk: contactRecord?.contact_id,
          agency_user_fk: contactRecord?.agency_user_fk,
          msg_id: null,
          msg_body: `${sanitizedFinalResponse}`,
          media_url: null,
          media_msg_id: null,
          content_type: null,
          file_name: null,
          caption: null,
          msg_type: 'frompave',
          msg_timestamp,
          sender_number,
          sender_url,
          receiver_number,
          receiver_url: null,
          reply_to_event_id: null,
          reply_to_content: null,
          reply_to_msg_type: null,
          reply_to_file_name: null,
          reply_to_contact_id: null,
          delivered: 0,
          read: 0,
          original_event_id: result?.original_event_id,
          failed: h.isEmpty(result?.original_event_id),
          failed_reason,
          sent: h.notEmpty(result?.original_event_id),
          created_date_raw: new Date(),
          created_date: `${formattedDate} ${formattedTime}`,
        });

        if (h.notEmpty(result.original_event_id)) {
          await models.whatsapp_chat.update(
            {
              msg_id: `completed_${latestPaveMessage.dataValues.msg_id}`,
            },
            {
              where: {
                whatsapp_chat_id: latestPaveMessage.dataValues.whatsapp_chat_id,
              },
              transaction,
            },
          );

          await messageInventory.addMessageCount(agency.dataValues.agency_id);
          await agencyNotification.checkMessageCapacityAfterUpdate(
            agency.dataValues.agency_id,
          );

          const contact_source = await models.contact_source.findOne({
            where: {
              contact_fk: contactRecord?.contact_id,
              source_type: 'SALESFORCE',
            },
          });
          if (!h.isEmpty(contact_source)) {
            const agencyUser = await models.agency_user.findOne({
              where: {
                agency_user_id: contactRecord?.agency_user_fk,
              },
              include: [
                {
                  model: models.user,
                  required: true,
                },
                { model: models.agency, required: true },
              ],
            });

            const liveChatSettings = await models.live_chat_settings.findOne({
              where: {
                agency_fk: contactRecord?.agency_fk,
              },
            });
            const agencyOauth = await models.agency_oauth.findOne({
              where: {
                agency_fk: contactRecord?.agency_fk,
                status: 'active',
                source: 'SALESFORCE',
              },
            });

            const contactSalesforceData =
              await contactSalesforceDataCtrl.findOne(
                {
                  agency_fk: contactRecord?.agency_fk,
                  contact_fk: contactRecord?.contact_id,
                },
                {
                  order: [['created_date', 'DESC']],
                },
              );

            await h.salesforce.transmitMessage({
              liveChatSettings,
              contactSalesforceData,
              oauth: agencyOauth,
              contact: contactRecord,
              contact_source,
              currentAgencyUser: agencyUser,
              full_message_body: final_response,
              messageType: 'plain_frompave',
              platform: 'whatsapp',
              log,
              encryptionKeys: additionalConfig.ek,
            });
          }
        }
      }
    }
  };

  /**
   * This is for handling sending of message interaction notification triggered by contacts
   *
   * @async
   * @constant
   * @name handleUserMessageInteractionNotification
   */
  whatsAppCtrl.handleUserMessageInteractionNotification = async (
    {
      sender_number,
      receiver_number,
      chat_id,
      contact_id,
      fullName,
      msgType,
      replyMsg,
      agency_id,
      agency_user_id,
      newMsg,
      log,
      models,
    },
    { transaction },
  ) => {
    const agency = await agencyCtrl.findOne(
      { agency_id: agency_id },
      { transaction },
    );

    const contactRecord = await contactCtrl.findOne({
      contact_id: contact_id,
      agency_fk: agency_id,
    });

    const agency_user = await agencyUserCtrl.findOne(
      { agency_user_id: contactRecord.agency_user_fk },
      {
        include: {
          model: models.user,
          required: true,
        },
        transaction,
      },
    );

    let contactfullName = '';
    if (contactRecord.first_name && contactRecord.last_name) {
      contactfullName = contactRecord.first_name.concat(
        ' ',
        contactRecord.last_name,
      );
    } else if (contactRecord.first_name) {
      contactfullName = contactRecord.first_name;
    } else if (contactRecord.last_name) {
      contactfullName = contactRecord.last_name;
    } else {
      contactfullName = fullName || 'Contact';
    }

    log.info({
      action: 'sending user message interaction notification',
      data: {
        agency_id: agency_id,
        chat_id: chat_id,
        contact_id: contact_id,
        agent_name: agency_user.user.first_name,
        agent_email: agency_user.user.email,
        additional_emails: agency?.agency_campaign_additional_recipient,
        contact_name: contactfullName,
        replyMsg: replyMsg,
        msgType: msgType,
        newMsg: newMsg,
        log,
      },
    });

    h.whatsapp.notifyUserMessageInteraction({
      agency_id: agency_id,
      agent_name: agency_user.user.first_name,
      agent_email: agency_user.user.email,
      additional_emails: agency?.agency_campaign_additional_recipient,
      chat_id: chat_id,
      contact_id: contact_id,
      contact_name: contactfullName,
      replyMsg: replyMsg,
      msgType: msgType,
      newMsg: newMsg,
      log,
    });

    const note_label = 'WhatsApp User Message';
    const contact_note = `User Reply | | ${replyMsg} | https://wa.me/${contactRecord.mobile_number}`;

    h.campaign.sendContactNote({
      log,
      note: contact_note,
      contact_id,
      agency_id: contactRecord.agency_fk,
      campaign_name: note_label,
      models,
    });
  };

  /**
   * This is for handling message interaction notifications
   * (
   *
   * @async
   * @constant
   * @name handleMessageInteractionNotification
   */
  whatsAppCtrl.handleMessageInteractionNotification = async (
    {
      sender_number,
      receiver_number,
      campaign_name,
      chat_id,
      contact_id,
      replyMsg,
      msgType,
      msgOrigin,
      log,
      models,
    },
    { transaction },
  ) => {
    const contactRecord = await contactCtrl.findOne({
      contact_id: contact_id,
    });

    const agency = await agencyCtrl.findOne(
      { agency_id: contactRecord.agency_fk },
      { transaction },
    );

    const agency_user = await agencyUserCtrl.findOne(
      { agency_user_id: contactRecord.agency_user_fk },
      {
        include: {
          model: models.user,
          required: true,
        },
        transaction,
      },
    );

    const shortlistedProjectRecords = await shortlistedProjectCtrl.findAll(
      { contact_fk: contact_id, is_deleted: false },
      {
        include: [
          {
            model: models.project,
            required: true,
          },
        ],
        transaction,
      },
    );

    const shortListedProjectNames = shortlistedProjectRecords.map((m) => {
      return m.project.name;
    });

    const messageTracker = await whatsappMessageTrackerCtrl.findOne(
      {
        receiver_number,
        sender_number,
        tracker_type: 'main',
      },
      {
        order: [['created_date', 'DESC']],
        transaction,
      },
    );

    let fullName = '';

    if (contactRecord.first_name && contactRecord.last_name) {
      fullName = contactRecord.first_name.concat(' ', contactRecord.last_name);
    } else if (contactRecord.first_name) {
      fullName = contactRecord.first_name;
    } else if (contactRecord.last_name) {
      fullName = contactRecord.last_name;
    } else {
      fullName = 'Contact';
    }

    const campaign_cta = await models.campaign_cta.findOne({
      where: {
        campaign_tracker_ref_name: messageTracker.tracker_ref_name,
      },
      transaction,
    });

    const event_details = await models.agency_campaign_event_details.findOne({
      where: {
        tracker_ref_name: messageTracker.tracker_ref_name,
      },
      transaction,
    });

    log.info({
      action: 'sending whatsapp message interaction notification',
      data: {
        agency_id: contactRecord.agency_fk,
        is_real_estate: h.cmpStr(agency.real_estate_type, 'REAL_ESTATE'),
        agent_name: agency_user.user.first_name,
        agent_email: agency_user.user.email,
        additional_emails:
          campaign_cta?.campaign_notification_additional_recipients,
        chat_id: chat_id,
        contact_id: contact_id,
        contact_name: fullName,
        shortlisted_projects: shortListedProjectNames,
        tracker_ref_name: messageTracker.tracker_ref_name,
        wa_link: `https://wa.me/${contactRecord.mobile_number}`,
        replyMsg: replyMsg,
        msgType: msgType,
        is_confirmation: campaign_cta?.is_confirmation,
        event_details: event_details,
      },
    });

    if (h.cmpStr(msgOrigin, 'campaign')) {
      h.whatsapp.notifyMessageInteraction({
        agency_id: contactRecord.agency_fk,
        agent_name: agency_user.user.first_name,
        agent_email: agency_user.user.email,
        additional_emails:
          campaign_cta?.campaign_notification_additional_recipients,
        chat_id: chat_id,
        contact_id: contact_id,
        contact_name: fullName,
        shortlisted_projects: shortListedProjectNames,
        tracker_ref_name: messageTracker.tracker_ref_name,
        wa_link: `https://wa.me/${contactRecord.mobile_number}`,
        reply_msg: replyMsg,
        msgType: msgType,
        is_cta1: h.cmpStr(replyMsg, campaign_cta?.cta_1),
        is_cta2: h.cmpStr(replyMsg, campaign_cta?.cta_2),
        is_confirmation: campaign_cta?.is_confirmation,
        event_details: event_details,
        is_real_estate: h.cmpStr(agency.real_estate_type, 'REAL_ESTATE'),
        log,
      });
    } else {
      h.whatsapp.notifyUserMessageInteraction({
        agency_id: contactRecord.agency_fk,
        agent_name: agency_user.user.first_name,
        agent_email: agency_user.user.email,
        additional_emails: agency?.agency_campaign_additional_recipient,
        chat_id: chat_id,
        contact_name: fullName,
        replyMsg: replyMsg,
        msgType: msgType,
        newMsg: false,
        log,
      });
    }

    let note_label = null;
    let contact_note = null;
    if (!h.isEmpty(campaign_cta)) {
      note_label = campaign_name;
      contact_note = `Whatsapp Campaign Reply | ${
        campaign_name || messageTracker.tracker_ref_name
      } | ${replyMsg} | https://wa.me/${contactRecord.mobile_number}`;
    } else {
      note_label = 'User Message';
      contact_note = `User Reply | | ${replyMsg} | https://wa.me/${contactRecord.mobile_number}`;
    }
    h.campaign.sendContactNote({
      log,
      note: contact_note,
      contact_id,
      agency_id: contactRecord.agency_fk,
      campaign_name: note_label,
      models,
    });
  };

  /**
   * This function is used to determine the correct WABA record to be used when handling an incoming message.
   *
   * @async
   * @constant
   * @name routeCheck
   */
  whatsAppCtrl.routeCheck = async (
    { sender_number, receiver_number, message },
    { transaction },
  ) => {
    // to check only for waba number record - this is for regular WABA only
    const where = {
      waba_number: sender_number,
    };
    const trial_agency = await agencyCtrl.findOne({
      trial_code: message.trim(),
    });

    if (h.isEmpty(trial_agency)) {
      // if trial code does not matched the message received, check for the latest message tracker for the waba and contact
      const latestChat = await whatsappMessageTrackerCtrl.findOne(
        {
          sender_number,
          receiver_number,
        },
        {
          order: [['created_date', 'DESC']],
          transaction,
        },
      );
      // if there is a record already, use the agency id to limit the WABA search to the agency
      if (h.notEmpty(latestChat)) {
        where.agency_fk = latestChat?.agency_fk;
      } else {
        where.trial_number_to_use = false;
      }
    } else {
      // limit searching of WABA to specific agency only if found as trial and message received is the trial code
      where.agency_fk = trial_agency?.agency_id;
    }
    const wabaOwner = await agencyWhatsAppConfigCtrl.findOne(where, {
      transaction,
    });
    return wabaOwner;
  };

  whatsAppCtrl.sendTrialMessage = async (
    {
      wabaOwner,
      contactRecord,
      sender_number,
      sender_url,
      receiver_number,
      receiver_url,
      campaign_name,
      whatsapp_message_tracker_id,
      tracker_ref_name,
      log,
      additionalConfig,
    },
    { transaction },
  ) => {
    try {
      // generating the trial message without using templates
      const { fullMessageBody, sendMessagePartsData } =
        await h.whatsapp.getTrialMessageBody({
          contact_name: h.general.prettifyConstant(contactRecord?.first_name),
          receiver_number,
        });

      const { whatsapp_config } = await models.agency_config.findOne({
        where: { agency_fk: wabaOwner?.agency_fk },
      });
      const config = JSON.parse(whatsapp_config);
      const environment = config.environment;

      const agencyWhatsAppCredentials = h.notEmpty(
        wabaOwner?.agency_whatsapp_api_token,
      )
        ? wabaOwner?.agency_whatsapp_api_token +
          ':' +
          wabaOwner?.agency_whatsapp_api_secret
        : null;
      const agencyBufferedCredentials = h.notEmpty(agencyWhatsAppCredentials)
        ? Buffer.from(agencyWhatsAppCredentials, 'utf8').toString('base64')
        : null;

      const canContinueAutomationSending =
        await messageInventory.checkIfCanSendMessage(
          contactRecord?.agency_fk,
          null,
          log,
        );
      let sendWhatsAppMessageResponse;
      let failed_reason = null;
      if (h.cmpBool(canContinueAutomationSending.can_continue, false)) {
        sendWhatsAppMessageResponse = { original_event_id: null };
        const reason = h.general.getMessageByCode(
          canContinueAutomationSending.reason,
        );
        failed_reason = JSON.stringify([{ code: 100000, title: reason }]);
      } else {
        // send the trial message to the contact recipient
        sendWhatsAppMessageResponse = await h.whatsapp.sendWhatsAppMessage(
          receiver_number,
          false,
          fullMessageBody,
          sendMessagePartsData,
          agencyBufferedCredentials,
          environment,
          log,
        );
      }

      const trial_message_date = new Date();
      const msg_timestamp = Math.floor(trial_message_date.getTime() / 1000);

      const appsync = await appSyncCredentialsCtrl.findOne({
        status: 'active',
      });
      const { api_key } = appsync;

      const created_date = trial_message_date;

      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      const date = new Date(created_date);
      const formattedDate = date.toLocaleDateString('en-US', options);

      const timeOptions = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      };
      const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
      const sanitizedFullMessageBody =
        h.general.sanitizeMaliciousAttributes(fullMessageBody);
      const appSyncData = {
        position: 7,
        platform: 'whatsapp',
        campaign_name: campaign_name,
        agency_fk: contactRecord?.agency_fk,
        contact_fk: contactRecord?.contact_id,
        agency_user_fk: contactRecord?.agency_user_fk,
        original_event_id: sendWhatsAppMessageResponse?.original_event_id,
        msg_id: null,
        msg_body: `${sanitizedFullMessageBody}`,
        media_url: null,
        media_msg_id: null,
        content_type: null,
        file_name: null,
        caption: null,
        msg_type: 'frompave',
        msg_timestamp,
        sender_number,
        sender_url,
        receiver_number,
        receiver_url: null,
        reply_to_event_id: null,
        reply_to_content: null,
        reply_to_msg_type: null,
        reply_to_file_name: null,
        reply_to_contact_id: null,
        failed: 1,
        created_date_raw: trial_message_date,
        created_date: `${formattedDate} ${formattedTime}`,
      };
      // if sending is success, record message
      if (!h.isEmpty(sendWhatsAppMessageResponse.original_event_id)) {
        await messageInventory.addMessageCount(wabaOwner?.agency_fk);
        await agencyNotification.checkMessageCapacityAfterUpdate(
          wabaOwner?.agency_fk,
        );

        const whatsapp_chat_id = await whatsappChatCtrl.create(
          {
            campaign_name: campaign_name,
            msg_id: null,
            msg_timestamp,
            sender_number,
            sender_url,
            receiver_number,
            receiver_url: `whatsappcloud://${receiver_number}@whatsapp.com`,
            agency_fk: contactRecord?.agency_fk,
            agency_user_fk: contactRecord?.agency_user_fk,
            contact_fk: contactRecord?.contact_id,
            original_event_id: sendWhatsAppMessageResponse?.original_event_id,
            msg_type: 'frompave',
            msg_body: `${sanitizedFullMessageBody}`,
            failed_reason,
          },
          { transaction },
        );
        await models.unified_inbox.update(
          {
            created_date: trial_message_date,
            updated_date: trial_message_date,
            msg_id: whatsapp_chat_id,
            msg_type: 'frompave',
            last_msg_date: trial_message_date,
            msg_body: `${sanitizedFullMessageBody}`,
            pending: 0,
          },
          {
            where: {
              tracker_id: whatsapp_message_tracker_id,
              msg_platform: 'whatsapp',
            },
            transaction,
          },
        );

        // creating handler for the quick replies
        await campaignCTACtrl.create(
          {
            campaign_tracker_ref_name: tracker_ref_name,
            message_channel: 'whatsapp',
            is_workflow: false,
            cta_1: 'Learn about Chaaat',
            cta_1_response:
              'To learn more about Chaaat, please click this link: https://chaaat.io',
            cta_2: 'Pricing Details',
            cta_2_response:
              'To learn more about the pricing details, please click this link: https://chaaat.io',
            cta_3: 'Contact Us',
            cta_3_response:
              'Please click this link to get started: https://calendly.com/demo-3r-3/30min',
          },
          { transaction },
        );

        appSyncData.sent = 1;
        appSyncData.delivered = 0;
        appSyncData.read = 0;

        await h.appsync.sendGraphQLNotification(api_key, appSyncData);

        const contact_source = await models.contact_source.findOne({
          where: {
            contact_fk: contactRecord?.contact_id,
            source_type: 'SALESFORCE',
          },
        });
        if (!h.isEmpty(contact_source)) {
          const agencyUser = await models.agency_user.findOne({
            where: {
              agency_user_id: contactRecord?.agency_user_fk,
            },
            include: [
              {
                model: models.user,
                required: true,
              },
              { model: models.agency, required: true },
            ],
          });

          const liveChatSettings = await models.live_chat_settings.findOne({
            where: {
              agency_fk: contactRecord?.agency_fk,
            },
          });
          const agencyOauth = await models.agency_oauth.findOne({
            where: {
              agency_fk: contactRecord?.agency_fk,
              status: 'active',
              source: 'SALESFORCE',
            },
          });
          const contactSalesforceData = await contactSalesforceDataCtrl.findOne(
            {
              agency_fk: contactRecord?.agency_fk,
              contact_fk: contactRecord?.contact_id,
            },
            {
              order: [['created_date', 'DESC']],
            },
          );
          await h.salesforce.transmitMessage({
            liveChatSettings,
            contactSalesforceData,
            oauth: agencyOauth,
            contact: contactRecord,
            contact_source,
            currentAgencyUser: agencyUser,
            full_message_body: fullMessageBody,
            messageType: 'template',
            platform: 'whatsapp',
            log,
            encryptionKeys: additionalConfig.ek,
          });
        }
      } else {
        const whatsapp_chat_id = await whatsappChatCtrl.create(
          {
            campaign_name: campaign_name,
            msg_id: null,
            msg_timestamp,
            sender_number,
            sender_url,
            receiver_number,
            receiver_url: `whatsappcloud://${receiver_number}@whatsapp.com`,
            agency_fk: contactRecord?.agency_fk,
            agency_user_fk: contactRecord?.agency_user_fk,
            contact_fk: contactRecord?.contact_id,
            original_event_id: sendWhatsAppMessageResponse?.original_event_id,
            msg_type: 'frompave',
            failed: 1,
            msg_body: `${sanitizedFullMessageBody}`,
            failed_reason,
          },
          { transaction },
        );
        await models.unified_inbox.update(
          {
            created_date: trial_message_date,
            updated_date: trial_message_date,
            msg_id: whatsapp_chat_id,
            msg_type: 'frompave',
            last_msg_date: trial_message_date,
            msg_body: `${sanitizedFullMessageBody}`,
            pending: 0,
          },
          {
            where: {
              tracker_id: whatsapp_message_tracker_id,
              msg_platform: 'whatsapp',
            },
            transaction,
          },
        );
        appSyncData.failed = 1;
      }
      await h.appsync.sendGraphQLNotification(api_key, appSyncData);
    } catch (err) {
      log.error({
        action: 'WHATSAPP TRIAL MESSAGE SENDING ERROR',
        response: err,
      });
      throw new Error('WHATSAPP TRIAL MESSAGE SENDING ERROR');
    }
  };

  return whatsAppCtrl;
};
