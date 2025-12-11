const h = require('../../../helpers');
const { Op } = require('sequelize');
const constant = require('../../../constants/constant.json');
const { performance } = require('perf_hooks');

module.exports.makeController = (models) => {
  const {
    agency: agencyModel,
    agency_user: agencyUserModel,
    appsync_credentials: appsyncModel,
    contact: contactModel,
    contact_source: contactSourceModel,
    line_chat: lineChatModel,
    line_follower: lineFollowerModel,
    line_message_tracker: lineMessageTrackerModel,
    unified_inbox: unifiedInboxModel,
    user: userModel,
    contact_salesforce_data: contactSalesforceDataModel,
  } = models;

  const contactSalesforceData =
    require('../../contactSalesforceData').makeController(models);

  const lineCtl = {};

  lineCtl.processImageMessage = async (data, log, { transaction } = {}) => {
    try {
      const funcName = 'lineCtl.processImageMessage';
      const {
        agency_id,
        agency_channel_config_id,
        api_token,
        api_secret,
        agent_line_id,
        agent_line_url,
        contact_line_id,
        contact_line_url,
        msg_type,
        content,
        event_id,
        msg_id,
        reply_token,
        quote_token,
        reply_to_msg_id,
        reply_to_content,
        reply_to_msg_type,
        reply_to_contact_id,
        timestamp,
        agency_channel,
        additionalConfig,
      } = data;
      log.info({
        agency_id,
        agency_channel_config_id,
        api_token,
        api_secret,
        agent_line_id,
        agent_line_url,
        contact_line_id,
        contact_line_url,
        msg_type,
        content,
        event_id,
        msg_id,
        reply_token,
        quote_token,
        reply_to_msg_id,
        reply_to_content,
        reply_to_msg_type,
        reply_to_contact_id,
        timestamp,
      });
      const contactProcessingStartTime = performance.now();
      const agency = await agencyModel.findOne({
        where: {
          agency_id: agency_id,
        },
      });
      let contact_id;
      let agency_user_id;
      let new_contact = true;
      const contact = await contactModel.findOne({
        where: {
          agency_fk: agency_id,
          line_user_id: contact_line_id,
        },
      });

      let contactFirstName;
      let contactLastName;
      let status = 'active';

      if (!h.isEmpty(contact)) {
        new_contact = false;
        contact_id = contact.dataValues.contact_id;
        agency_user_id = contact.dataValues.agency_user_fk;

        const contactSource = await contactSourceModel.findOne({
          where: {
            contact_fk: contact_id,
            source_contact_id: contact_line_id,
            source_type: 'LINE',
          },
        });

        if (!contactSource) {
          const contact_source_id = h.general.generateId();
          await contactSourceModel.create(
            {
              contact_source_id,
              contact_fk: contact_id,
              source_contact_id: contact_line_id,
              source_type: 'LINE',
            },
            { transaction },
          );
        }
        contactFirstName = contact.dataValues.first_name;
        contactLastName = contact.dataValues.last_name;
      } else {
        let colorRandomKey;
        let objectRandomKey;

        const lineUserProfile = await h.general.getLineDirectChannelUserProfile(
          {
            user_profile_id: contact_line_id,
            api_token,
            api_secret,
          },
        );

        if (
          !h.isEmpty(lineUserProfile) &&
          !h.isEmpty(lineUserProfile.displayName)
        ) {
          const lineProfileName = lineUserProfile.displayName;
          const firstSpaceIndex = lineProfileName.indexOf(' ');
          if (!h.cmpInt(firstSpaceIndex, -1)) {
            contactFirstName = lineProfileName.slice(0, firstSpaceIndex);
            contactLastName = lineProfileName.slice(firstSpaceIndex + 1);
          } else {
            contactFirstName = lineProfileName;
            contactLastName = null;
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
          [objectRandomKey, contactLastName] = objectEntries[objectRandomIndex];
          status = 'outsider';
        }
        let contactOwnerDetails = null;
        let contactOwner = null;
        if (!h.isEmpty(agency?.default_outsider_contact_owner)) {
          contactOwner = agency?.default_outsider_contact_owner;
        } else {
          if (h.cmpStr(agency_id, '1f880948-0097-40a8-b431-978fd59ca321')) {
            contactOwnerDetails = await userModel.findOne({
              where: {
                user_id: '5544d047-cf62-4f5f-9165-498869a68157',
              },
              include: [
                {
                  model: models.agency_user,
                  where: {
                    agency_fk: agency_id,
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
            contactOwnerDetails = await userModel.findOne({
              where: {
                email: {
                  [Op.like]: `%support%`,
                },
              },
              include: [
                {
                  model: models.agency_user,
                  where: {
                    agency_fk: agency_id,
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
        agency_user_id = contactOwner;
        contact_id = h.general.generateId();
        await contactModel.create(
          {
            contact_id,
            first_name: contactFirstName,
            last_name: contactLastName,
            email: null,
            mobile_number: null,
            is_whatsapp: 0,
            line_user_id: contact_line_id,
            agency_fk: agency_id,
            agency_user_fk: agency_user_id,
            from_export: false,
            status: status,
          },
          { transaction },
        );

        const contactSource = await contactSourceModel.findOne({
          where: {
            contact_fk: contact_id,
            source_contact_id: contact_line_id,
            source_type: 'LINE',
          },
        });

        if (h.isEmpty(contactSource)) {
          const contact_source_id = h.general.generateId();
          await contactSourceModel.create(
            {
              contact_source_id,
              contact_fk: contact_id,
              source_contact_id: contact_line_id,
              source_type: 'LINE',
            },
            { transaction },
          );
        }
      }

      const lineFollower = await lineFollowerModel.findOne({
        where: {
          agency_fk: agency_id,
          agency_channel_config_fk: agency_channel_config_id,
          line_user_fk: contact_line_id,
        },
      });

      if (h.isEmpty(lineFollower)) {
        const line_follower_id = h.general.generateId();
        await lineFollowerModel.create(
          {
            line_follower_id,
            agency_fk: agency_id,
            agency_channel_config_fk: agency_channel_config_id,
            contact_fk: contact_id,
            line_user_fk: contact_line_id,
            status: 'active',
          },
          { transaction },
        );
      } else {
        await lineFollowerModel.update(
          {
            contact_fk: contact_id,
            status: 'active',
          },
          {
            where: {
              line_follower_id: lineFollower.dataValues.line_follower_id,
            },
            transaction,
          },
        );
      }
      const contactProcessingEndTime = performance.now();
      const contactProcessingDuration =
        contactProcessingEndTime - contactProcessingStartTime;
      log.info({
        message: `Contact processing in Line direct image API call took ${contactProcessingDuration} milliseconds`,
      });
      const messageProcessingStartTime = performance.now();
      const trackerEntry = await lineMessageTrackerModel.findOne({
        where: {
          agency_fk: agency_id,
          contact_fk: contact_id,
          receiver: contact_line_id,
          tracker_type: 'main',
        },
        order: [['created_date', 'DESC']],
      });

      let tracker_ref_name;
      let campaign_name;
      let line_message_tracker_id;
      const mediaURL = await h.line.getDirectMediaURL(
        {
          msg_type: msg_type,
          message_id: content,
          contact_line_id,
          token: api_token,
        },
        log,
      );

      if (h.isEmpty(trackerEntry)) {
        tracker_ref_name = `${Date.now()}_user_message_${agency?.dataValues?.agency_name
          .replaceAll(' ', '_')
          .toLowerCase()}`;
        campaign_name = `${Date.now()} ${
          agency?.dataValues?.agency_name
        } ${contact_id}`;
        line_message_tracker_id = h.general.generateId();
        await lineMessageTrackerModel.create(
          {
            line_message_tracker_id,
            campaign_name,
            campaign_name_label: campaign_name,
            tracker_ref_name,
            agency_fk: agency_id,
            agency_user_fk: agency_user_id,
            contact_fk: contact_id,
            line_webhook_event_id: event_id,
            msg_id: msg_id,
            msg_type,
            msg_origin: 'user_message',
            msg_body: !h.isEmpty(mediaURL) ? mediaURL.fileURL : content,
            sender: agent_line_id,
            sender_url: agent_line_url,
            receiver: contact_line_id,
            receiver_url: contact_line_url,
            batch_count: 1,
            template_count: 1,
            tracker_type: 'main',
            pending: 0,
            sent: 1,
            delivered: 1,
            failed: 0,
            read: 1,
            replied: 1,
            msg_trigger: 'user_message',
            broadcast_date: new Date(),
            visible: 0,
          },
          { transaction },
        );
      } else {
        log.info({
          contact_fk: contact_id,
          tracker_ref_name: trackerEntry.dataValues.tracker_ref_name,
        });
        await lineMessageTrackerModel.update(
          {
            read: 1,
            replied: 1,
          },
          {
            where: {
              contact_fk: contact_id,
              tracker_ref_name: trackerEntry.dataValues.tracker_ref_name,
              receiver: contact_line_id,
            },
            transaction,
          },
        );
        tracker_ref_name = trackerEntry.dataValues.tracker_ref_name;
        campaign_name = trackerEntry.dataValues.campaign_name;
        line_message_tracker_id =
          trackerEntry.dataValues.line_message_tracker_id;
      }

      const line_chat_id = h.general.generateId();
      await lineChatModel.create(
        {
          line_chat_id,
          campaign_name,
          agency_fk: agency_id,
          agency_user_fk: agency_user_id,
          contact_fk: contact_id,
          line_webhook_event_fk: event_id,
          msg_id: msg_id,
          msg_type,
          msg_origin: 'user_message',
          msg_timestamp: timestamp,
          msg_body: !h.isEmpty(mediaURL) ? mediaURL.fileURL : content,
          reply_token,
          quote_token,
          media_url: !h.isEmpty(mediaURL) ? mediaURL.fileURL : null,
          media_msg_id: content,
          sender: agent_line_id,
          sender_url: agent_line_url,
          receiver: contact_line_id,
          receiver_url: contact_line_url,
          sent: 1,
          delivered: 1,
          failed: 0,
          read: 1,
          replied: 1,
          reply_to_msg_id,
          reply_to_content,
          reply_to_msg_type,
          reply_to_contact_id,
        },
        { transaction },
      );
      await lineChatModel.update(
        {
          read: 1,
          replied: 1,
        },
        {
          where: {
            sender: agent_line_id,
            receiver: contact_line_id,
            failed: 0,
          },
          transaction,
        },
      );
      const hasUnifiedEntry = await unifiedInboxModel.findOne({
        where: {
          agency_fk: agency_id,
          contact_fk: contact_id,
          msg_platform: 'line',
          tracker_type: 'main',
        },
      });

      if (h.isEmpty(hasUnifiedEntry)) {
        const unified_inbox_id = h.general.generateId();
        await unifiedInboxModel.create(
          {
            unified_inbox_id: unified_inbox_id,
            tracker_id: line_message_tracker_id,
            tracker_ref_name,
            campaign_name: campaign_name,
            agency_fk: agency_id,
            contact_fk: contact_id,
            agency_user_fk: agency_user_id,
            event_id: event_id,
            msg_body: !h.isEmpty(mediaURL) ? mediaURL.fileURL : content,
            msg_type,
            msg_platform: 'line',
            sender: agent_line_id,
            sender_url: agent_line_url,
            receiver: contact_line_id,
            receiver_url: contact_line_url,
            pending: false,
            sent: 1,
            delivered: 1,
            read: 1,
            replied: 1,
            batch_count: 1,
            broadcast_date: new Date(),
            last_msg_date: new Date(),
            tracker_type: 'main',
          },
          { transaction },
        );
      } else {
        await unifiedInboxModel.update(
          {
            tracker_ref_name,
            campaign_name: campaign_name,
            agency_fk: agency_id,
            contact_fk: contact_id,
            agency_user_fk: agency_user_id,
            event_id: event_id,
            msg_body: !h.isEmpty(mediaURL) ? mediaURL.fileURL : content,
            msg_type,
            msg_platform: 'line',
            pending: false,
            sent: 1,
            delivered: 1,
            read: 1,
            replied: 1,
            batch_count: 1,
            broadcast_date: new Date(),
            last_msg_date: new Date(),
            tracker_type: 'main',
            sender: agent_line_id,
            sender_url: agent_line_url,
            receiver: contact_line_id,
            receiver_url: contact_line_url,
          },
          {
            where: {
              unified_inbox_id: hasUnifiedEntry.dataValues.unified_inbox_id,
            },
            transaction,
          },
        );
      }

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
      const { api_key } = appsync;

      await h.appsync.sendGraphQLNotification(api_key, {
        platform: 'line',
        line_chat_id,
        campaign_name,
        agency_fk: agency_id,
        agency_user_fk: agency_user_id,
        contact_fk: contact_id,
        line_webhook_event_fk: event_id,
        msg_id: msg_id,
        msg_type,
        msg_origin: 'user_message',
        msg_timestamp: timestamp,
        msg_body: !h.isEmpty(mediaURL) ? mediaURL.fileURL : content,
        reply_token,
        quote_token,
        media_url: !h.isEmpty(mediaURL) ? mediaURL.fileURL : content,
        sender: agent_line_id,
        sender_url: agent_line_url,
        receiver: contact_line_id,
        receiver_url: contact_line_url,
        sent: 1,
        delivered: 1,
        failed: 0,
        read: 1,
        replied: 1,
        created_date_raw: new Date(),
        created_date: `${formattedDate} ${formattedTime}`,
        reply_to_msg_id,
        reply_to_content,
        reply_to_msg_type,
        reply_to_contact_id,
        agency_channel_config: agency_channel,
      });

      let fullName;
      if (contactFirstName && contactLastName) {
        fullName = contactFirstName.concat(' ', contactLastName);
      } else if (contactFirstName) {
        fullName = contactFirstName;
      } else if (contactLastName) {
        fullName = contactLastName;
      } else {
        fullName = 'Contact';
      }

      const agency_user = await agencyUserModel.findOne({
        where: {
          agency_user_id: agency_user_id,
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

      if (h.cmpBool(new_contact, false)) {
        const contactRecord = await models.contact.findOne({
          where: {
            contact_id: contact_id,
          },
        });

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
          const contactSalesforceRecord = await contactSalesforceData.findOne(
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
            contactSalesforceData: contactSalesforceRecord,
            oauth: agencyOauth,
            contact: contactRecord,
            contact_source,
            currentAgencyUser: agencyUser,
            full_message_body: !h.isEmpty(mediaURL)
              ? mediaURL.fileURL
              : content,
            messageType: 'image',
            platform: 'line',
            log,
            encryptionKeys: additionalConfig.ek,
          });
        }
      }

      await h.line.notifyMessageInteraction({
        agency_id: agency_id,
        agent_name: agency_user.user.dataValues.first_name,
        agent_email: agency_user.user.dataValues.email,
        additional_emails:
          agency_user.agency.dataValues.agency_campaign_additional_recipient,
        contact_name: fullName,
        msg: !h.isEmpty(mediaURL) ? mediaURL.fileURL : content,
        msgType: msg_type,
        log,
      });
      const messageProcessingEndTime = performance.now();
      const messageProcessingDuration =
        messageProcessingEndTime - messageProcessingStartTime;
      log.info({
        message: `Message processing in Line direct image API call took ${messageProcessingDuration} milliseconds`,
      });
      return { success: true, data: contact_id };
    } catch (err) {
      return { success: false, error: 'IMAGE PROCESSING ERROR', data: err };
    }
  };

  return lineCtl;
};
