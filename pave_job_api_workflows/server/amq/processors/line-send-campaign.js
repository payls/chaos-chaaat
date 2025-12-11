const Sentry = require('@sentry/node');
const constant = require('../../constants/constant.json');
const { contact, contactSalesforceData } = require('../../controllers');
const { Op } = require('sequelize');

module.exports = async ({
  data,
  models,
  channel,
  config,
  pubChannel,
  log,
  additionalConfig,
}) => {
  const { data: campaignData } = JSON.parse(data.content.toString());
  const {
    agency,
    line_channel,
    broadcast_date,
    user_id,
    agency_id,
    tracker_ref_name,
    campaign_name,
    campaign_label,
    contact_id,
    total,
    selected_line_channel,
    api_token,
    api_secret,
    templates,
    proposal,
    campaign_notification_additional_recipients,
    amq_progress_tracker_id,
  } = campaignData;
  const amqProgressTrackerController =
    require('../../controllers/amqProgressTracker').makeController(models);
  try {
    const contactController =
      require('../../controllers/contact').makeContactController(models);
    const userController = require('../../controllers/user').makeUserController(
      models,
    );
    const agencyUserController =
      require('../../controllers/agencyUser').makeAgencyUserController(models);
    const contactLeadScoreCtl =
      require('../../controllers/contactLeadScore').makeContactLeadScoreController(
        models,
      );
    const lineMessageTrackerCtl =
      require('../../controllers/lineMessageTracker').makeController(models);
    const unifiedInboxCtl =
      require('../../controllers/unifiedInbox').makeController(models);
    const lineChatCtl = require('../../controllers/lineChat').makeController(
      models,
    );
    const lineFollowerCtl =
      require('../../controllers/lineFollower').makeController(models);
    const appSyncCredentials =
      require('../../controllers/appSyncCredentials').makeController(models);
    const ContactService = require('../../services/staff/contact');
    const contactService = new ContactService();
    const h = require('../../helpers');

    // contact checking
    const contact_record_check_transaction =
      await models.sequelize.transaction();
    try {
      const contactRecord = await contactController.findOne({ contact_id });
      let contact_agent = contactRecord.agency_user_fk;

      if (h.isEmpty(contactRecord.agency_user_fk)) {
        if (h.notEmpty(user_id)) {
          const agencyUser = await agencyUserController.findOne({
            agency_user_id: contactRecord?.agency_user_fk,
          });
          contact_agent = agencyUser?.agency_user_id;
        } else if (
          h.isEmpty(user_id) &&
          h.notEmpty(agency?.default_outsider_contact_owner)
        ) {
          contact_agent = agency?.default_outsider_contact_owner;
        } else {
          const supportUser = await userController.findOne(
            {
              email: {
                [Op.like]: `%support%`,
              },
            },
            {
              include: [
                {
                  model: models.agency_user,
                  where: {
                    agency_fk: agency_id,
                  },
                },
              ],
            },
          );
          contact_agent = supportUser?.agency_user?.agency_user_id;
        }
      }
      if (contact_agent) {
        await contactController.update(
          contactRecord.contact_id,
          {
            agency_user_fk: contact_agent,
          },
          { transaction: contact_record_check_transaction },
        );
        await contact_record_check_transaction.commit();
      } else {
        // stop process
        log.info({
          message: `Skipping contact: ${contactRecord.contact_id} to receive campaign message`,
          data: campaignData,
          consumerType: 'SEND_LINE_CAMPAIGN',
        });
        throw new Error('NO ASSIGNED AGENT ERROR');
      }
    } catch (contactRecordTransErr) {
      log.error({
        action: 'CONTACT RECORD CHECKING',
        response: contactRecordTransErr,
      });
      Sentry.captureException(contactRecordTransErr);
      await contact_record_check_transaction.rollback();
      throw new Error('CONTACT RECORD CHECKING ERROR');
    }

    // contact sending
    const send_transaction = await models.sequelize.transaction();
    try {
      const contactRecord = await contactController.findOne({ contact_id });
      const agencyUser = await agencyUserController.findOne(
        {
          agency_user_id: contactRecord?.agency_user_fk,
        },
        {
          include: [
            {
              model: models.user,
              required: true,
            },
            { model: models.agency, required: true },
          ],
        },
      );
      const agentName = agencyUser?.user?.first_name;
      const contactFirstName = contactRecord?.first_name;
      const contactLastName = contactRecord?.last_name;
      const contactLineUserID = contactRecord?.line_user_id;
      const agencyName = agency?.agency_name;

      const template = templates[0].value;
      log.info({ template });

      const final_template = await h.linedirect.handleTemplateVariables({
        template,
        agentName,
        contactFirstName,
        contactLastName,
        agencyName,
      });

      const lineFollowed = await lineFollowerCtl.findOne({
        agency_fk: agency_id,
        contact_fk: contact_id,
        agency_channel_config_fk: selected_line_channel,
        line_user_fk: contactLineUserID,
        status: 'active',
      });

      let result;
      if (lineFollowed) {
        const final_template_content = JSON.parse(final_template.content);
        const message_config = {
          to: contactLineUserID,
          messages:
            final_template.type === 'BASIC'
              ? final_template_content
              : [final_template_content],
        };

        let api_credentials = api_token;
        if (h.isEmpty(api_credentials)) {
          const line_credentials = await models.agency_channel_config.findOne({
            where: {
              agency_channel_id: selected_line_channel,
            },
          });
          api_credentials = line_credentials?.api_token;
        }
        result = await h.linedirect.sendMessage({
          contact_line_id: contactLineUserID,
          message_config,
          api_credentials,
          log: log,
        });
      } else {
        result = {
          success: false,
          error: null,
          reason: 'Line contact not following',
        };
      }

      const appsync = await appSyncCredentials.findOne({
        status: 'active',
      });

      const { api_key } = appsync;

      const created_date = new Date();

      const options = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      };
      const date = new Date(created_date);
      const formattedDate = date.toLocaleDateString('en-US', options);

      const timeOptions = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      };
      const formattedTime = date.toLocaleTimeString('en-US', timeOptions);

      const line_message_tracker_id = h.general.generateId();
      await lineMessageTrackerCtl.create(
        {
          line_message_tracker_id,
          campaign_name,
          campaign_name_label: campaign_label,
          tracker_ref_name,
          agency_fk: agency_id,
          agency_user_fk: contactRecord?.agency_user_fk,
          contact_fk: contact_id,
          line_webhook_event_id: h.cmpBool(result.success, true)
            ? result.quoteToken
            : null,
          msg_id: h.cmpBool(result.success, true) ? result.msg_id : null,
          msg_type: 'frompave',
          msg_origin: 'campaign',
          msg_body: final_template.message,
          sender: line_channel?.channel_id,
          sender_url: `line://${line_channel?.channel_id}@`,
          receiver: contactLineUserID,
          receiver_url: `line://${contactLineUserID}@line.com`,
          batch_count: total,
          template_count: 1,
          tracker_type: 'main',
          pending: 0,
          sent: h.cmpBool(result.success, true),
          delivered: h.cmpBool(result.success, true),
          failed: !h.cmpBool(result.success, true),
          read: 0,
          replied: 0,
          msg_trigger: 'campaign',
          broadcast_date: new Date(broadcast_date),
          created_date: created_date,
          visible: 1,
        },
        { transaction: send_transaction },
      );

      const line_chat_id = h.general.generateId();
      const timestamp = Math.floor(Date.now() / 1000);
      await lineChatCtl.create(
        {
          line_chat_id,
          campaign_name,
          agency_fk: agency_id,
          agency_user_fk: contactRecord?.agency_user_fk,
          contact_fk: contact_id,
          line_webhook_event_fk: h.cmpBool(result.success, true)
            ? result.quoteToken
            : null,
          msg_id: h.cmpBool(result.success, true) ? result.msg_id : null,
          msg_type: 'frompave',
          msg_origin: 'campaign',
          msg_timestamp: timestamp,
          msg_body: final_template.message,
          reply_token: null,
          quote_token: h.cmpBool(result.success, true)
            ? result.quoteToken
            : null,
          sender: line_channel?.channel_id,
          sender_url: `line://${line_channel?.channel_id}@`,
          receiver: contactLineUserID,
          receiver_url: `line://${contactLineUserID}@line.com`,
          sent: h.cmpBool(result.success, true),
          delivered: h.cmpBool(result.success, true),
          failed: !h.cmpBool(result.success, true),
          read: 0,
          replied: 0,
          reply_to_msg_id: null,
          reply_to_content: null,
          reply_to_msg_type: null,
          reply_to_contact_id: null,
          created_date: created_date,
        },
        { transaction: send_transaction },
      );

      const hasUnifiedEntry = await unifiedInboxCtl.findOne({
        agency_fk: agency_id,
        contact_fk: contact_id,
        receiver: contactLineUserID,
        msg_platform: 'line',
        tracker_type: 'main',
      });

      if (h.isEmpty(hasUnifiedEntry)) {
        await unifiedInboxCtl.create(
          {
            tracker_id: line_message_tracker_id,
            tracker_ref_name,
            campaign_name: campaign_name,
            agency_user_fk: contactRecord?.agency_user_fk,
            agency_fk: agency_id,
            contact_fk: contact_id,
            event_id: h.cmpBool(result.success, true)
              ? result.quoteToken
              : null,
            msg_id: h.cmpBool(result.success, true) ? result.msg_id : null,
            msg_body: final_template.message,
            msg_type: 'frompave',
            msg_platform: 'line',
            pending: false,
            sender: line_channel?.channel_id,
            sender_url: `line://${line_channel?.channel_id}@`,
            receiver: contactLineUserID,
            receiver_url: `line://${contactLineUserID}@line.com`,
            batch_count: total,
            created_by: user_id,
            broadcast_date: new Date(broadcast_date),
            created_date: created_date,
            last_msg_date: new Date(broadcast_date),
            tracker_type: 'main',
          },
          {
            transaction: send_transaction,
          },
        );
      } else {
        await unifiedInboxCtl.update(
          hasUnifiedEntry.unified_inbox_id,
          {
            tracker_ref_name,
            campaign_name: campaign_name,
            agency_user_fk: contactRecord?.agency_user_fk,
            agency_fk: agency_id,
            contact_fk: contact_id,
            event_id: h.cmpBool(result.success, true)
              ? result.quoteToken
              : null,
            msg_id: h.cmpBool(result.success, true) ? result.msg_id : null,
            msg_body: final_template.message,
            msg_type: 'frompave',
            msg_platform: 'line',
            pending: false,
            sender: line_channel?.channel_id,
            sender_url: `line://${line_channel?.channel_id}@`,
            receiver: contactLineUserID,
            receiver_url: `line://${contactLineUserID}@line.com`,
            batch_count: total,
            created_by: user_id,
            broadcast_date: new Date(broadcast_date),
            last_msg_date: new Date(created_date),
            created_date: created_date,
            tracker_type: 'main',
          },
          user_id,
          {
            transaction: send_transaction,
          },
        );
      }

      await h.appsync.sendGraphQLNotification(api_key, {
        platform: 'line',
        line_chat_id: line_chat_id,
        campaign_name: campaign_name,
        agency_fk: agency_id,
        agency_user_fk: contactRecord?.agency_user_fk,
        contact_fk: contact_id,
        line_webhook_event_fk: h.cmpBool(result.success, true)
          ? result.quoteToken
          : null,
        msg_id: h.cmpBool(result.success, true) ? result.msg_id : null,
        quote_token: h.cmpBool(result.success, true) ? result.quoteToken : null,
        msg_type: 'frompave',
        msg_timestamp: timestamp,
        msg_body: final_template.message,
        msg_origin: 'campaign',
        sender: line_channel?.channel_id,
        sender_url: `line://${line_channel?.channel_id}@`,
        receiver: contactLineUserID,
        receiver_url: `line://${contactLineUserID}@line.com`,
        sent: 1,
        delivered: 1,
        read: 0,
        reply_to_content: null,
        reply_to_msg_type: null,
        reply_to_msg_id: null,
        reply_to_contact_id: null,
        created_date: `${formattedDate} ${formattedTime}`,
        agency_channel_config: line_channel,
      });

      if (h.cmpBool(result.success, true)) {
        const contact_source = await models.contact_source.findOne({
          where: {
            contact_fk: contact_id,
            source_type: 'SALESFORCE',
          },
        });
        if (!h.isEmpty(contact_source)) {
          const liveChatSettings = await models.live_chat_settings.findOne({
            where: {
              agency_fk: agency_id,
            },
          });
          const agencyOauth = await models.agency_oauth.findOne({
            where: {
              agency_fk: agency_id,
              status: 'active',
              source: 'SALESFORCE',
            },
          });
          const contactSalesforceRecord = await contactSalesforceData.findOne(
            {
              agency_fk: agency_id,
              contact_fk: contact_id,
            },
            {
              order: [['created_date', 'DESC']],
            },
          );
          await h.salesforce.transmitMessage({
            liveChatSettings: liveChatSettings,
            contactSalesforceData: contactSalesforceRecord,
            oauth: agencyOauth,
            contact: contactRecord,
            contact_source,
            currentAgencyUser: agencyUser,
            full_message_body: final_template.message,
            messageType: 'template',
            platform: 'line',
            log,
            encryptionKeys: additionalConfig.ek,
          });
        }
      }

      await amqProgressTrackerController.addSuccess(
        amq_progress_tracker_id,
        1,
        {
          transaction: send_transaction,
        },
      );
      await send_transaction.commit();
    } catch (sendError) {
      log.error({
        action: 'SEND MESSAGE',
        response: sendError,
      });
      Sentry.captureException(sendError);
      await send_transaction.rollback();
      throw new Error('SEND MESSAGE ERROR');
    }
    if (channel && channel.ack) {
      log.info('Channel for acknowledgment');
      return await channel.ack(data);
    } else {
      log.error('Channel not available for acknowledgment');
      throw new Error('AMQ channel not available');
    }
  } catch (mainErr) {
    log.error({
      err: mainErr,
      consumer: 'SEND_LINE_CAMPAIGN',
    });
    Sentry.captureException(mainErr);
    await amqProgressTrackerController.addError(amq_progress_tracker_id, 1);
    return await channel.nack(data, false, false);
  }
};
