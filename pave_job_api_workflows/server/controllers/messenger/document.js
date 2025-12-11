const h = require('../../helpers');
const { Op } = require('sequelize');
const constant = require('../../constants/constant.json');

module.exports.makeController = (models) => {
  const {
    agency: agencyModel,
    agency_channel_config: agencyChannelConfigModel,
    agency_user: agencyUserModel,
    appsync_credentials: appsyncModel,
    contact: contactModel,
    contact_source: contactSourceModel,
    messenger_chat: messengerChatModel,
    messenger_message_tracker: messengerMessageTrackerModel,
    unified_inbox: unifiedInboxModel,
    user: userModel,
  } = models;

  const messengerCtl = {};

  messengerCtl.processDocumentMessage = async (
    data,
    log,
    { transaction } = {},
  ) => {
    try {
      const funcName = 'messengerCtl.processDocumentMessage';
      const {
        agency_id,
        agency_channel_config_id,
        api_token,
        api_secret,
        agent_messenger_id,
        agent_messenger_url,
        contact_messenger_id,
        contact_messenger_url,
        msg_type,
        content,
        content_type,
        filename,
        event_id,
        reply_to_event_id,
        reply_to_content,
        reply_to_msg_type,
        reply_to_contact_id,
        timestamp,
      } = data;
      console.log({
        agency_id,
        agency_channel_config_id,
        api_token,
        api_secret,
        agent_messenger_id,
        agent_messenger_url,
        contact_messenger_id,
        contact_messenger_url,
        msg_type,
        content,
        content_type,
        filename,
        event_id,
        reply_to_event_id,
        reply_to_content,
        reply_to_msg_type,
        reply_to_contact_id,
        timestamp,
      });
      const agency = await agencyModel.findOne({
        where: {
          agency_id: agency_id,
        },
      });
      let contact_id;
      let agency_user_id;
      const contact = await contactModel.findOne({
        where: {
          agency_fk: agency_id,
          messenger_id: contact_messenger_id,
        },
      });

      let contactFirstName;
      let contactLastName;
      let status = 'active';

      await h.fbmessenger.addConnection({ contact_messenger_id }, log);

      if (!h.isEmpty(contact)) {
        contact_id = contact.dataValues.contact_id;
        agency_user_id = contact.dataValues.agency_user_fk;

        const contactSource = await contactSourceModel.findOne({
          where: {
            contact_fk: contact_id,
            source_contact_id: contact_messenger_id,
            source_type: 'FBMESSENGER',
          },
        });

        if (!contactSource) {
          const contact_source_id = h.general.generateId();
          await contactSourceModel.create(
            {
              contact_source_id,
              contact_fk: contact_id,
              source_contact_id: contact_messenger_id,
              source_type: 'FBMESSENGER',
            },
            { transaction },
          );
        }
        contactFirstName = contact.dataValues.first_name;
        contactLastName = contact.dataValues.last_name;
      } else {
        let colorRandomKey;
        let objectRandomKey;

        const messengerUserProfile = await h.general.getMessengerUserProfile({
          user_profile_id: contact_messenger_id,
          api_token,
        });
        if (!h.isEmpty(messengerUserProfile)) {
          contactFirstName = messengerUserProfile.first_name;
          contactLastName = messengerUserProfile.last_name;
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
            messenger_id: contact_messenger_id,
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
            source_contact_id: contact_messenger_id,
            source_type: 'FBMESSENGER',
          },
        });

        if (h.isEmpty(contactSource)) {
          const contact_source_id = h.general.generateId();
          await contactSourceModel.create(
            {
              contact_source_id,
              contact_fk: contact_id,
              source_contact_id: contact_messenger_id,
              source_type: 'FBMESSENGER',
            },
            { transaction },
          );
        }
      }

      const trackerEntry = await messengerMessageTrackerModel.findOne({
        where: {
          agency_fk: agency_id,
          contact_fk: contact_id,
          receiver: contact_messenger_id,
          tracker_type: 'main',
        },
      });

      let tracker_ref_name;
      let campaign_name;
      let messenger_message_tracker_id;

      if (h.isEmpty(trackerEntry)) {
        tracker_ref_name = `${Date.now()}_user_message_${agency?.dataValues?.agency_name
          .replaceAll(' ', '_')
          .toLowerCase()}`;
        campaign_name = `${Date.now()} ${
          agency?.dataValues?.agency_name
        } ${contact_id}`;
        messenger_message_tracker_id = h.general.generateId();
        await messengerMessageTrackerModel.create(
          {
            messenger_message_tracker_id,
            campaign_name,
            campaign_name_label: campaign_name,
            tracker_ref_name,
            agency_fk: agency_id,
            agency_user_fk: agency_user_id,
            contact_fk: contact_id,
            messenger_webhook_event_id: event_id,
            msg_id: null,
            msg_type,
            msg_origin: 'user_message',
            msg_body: content,
            sender: agent_messenger_id,
            sender_url: agent_messenger_url,
            receiver: contact_messenger_id,
            receiver_url: contact_messenger_url,
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
            visible: 1,
          },
          { transaction },
        );
      } else {
        tracker_ref_name = trackerEntry.dataValues.tracker_ref_name;
        campaign_name = trackerEntry.dataValues.campaign_name;
        messenger_message_tracker_id =
          trackerEntry.dataValues.messenger_message_tracker_id;
      }
      const messenger_chat_id = h.general.generateId();
      await messengerChatModel.create(
        {
          messenger_chat_id,
          campaign_name,
          agency_fk: agency_id,
          agency_user_fk: agency_user_id,
          contact_fk: contact_id,
          messenger_webhook_event_fk: event_id,
          msg_id: null,
          msg_type,
          msg_origin: 'user_message',
          msg_timestamp: timestamp,
          msg_body: content,
          media_url: content,
          content_type,
          file_name: filename,
          sender: agent_messenger_id,
          sender_url: agent_messenger_url,
          receiver: contact_messenger_id,
          receiver_url: contact_messenger_url,
          reply_to_event_id,
          reply_to_content,
          reply_to_msg_type,
          reply_to_contact_id,
          sent: 1,
          delivered: 1,
          failed: 0,
          read: 1,
          replied: 1,
        },
        { transaction },
      );
      const hasUnifiedEntry = await unifiedInboxModel.findOne({
        where: {
          agency_fk: agency_id,
          contact_fk: contact_id,
          msg_platform: 'fbmessenger',
          tracker_type: 'main',
        },
      });

      if (h.isEmpty(hasUnifiedEntry)) {
        const unified_inbox_id = h.general.generateId();
        await unifiedInboxModel.create(
          {
            unified_inbox_id: unified_inbox_id,
            tracker_id: messenger_message_tracker_id,
            tracker_ref_name,
            campaign_name: campaign_name,
            agency_fk: agency_id,
            contact_fk: contact_id,
            agency_user_fk: agency_user_id,
            event_id: event_id,
            msg_body: content,
            msg_type,
            msg_platform: 'fbmessenger',
            sender: agent_messenger_id,
            sender_url: agent_messenger_url,
            receiver: contact_messenger_id,
            receiver_url: contact_messenger_url,
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
            msg_body: content,
            msg_type,
            msg_platform: 'fbmessenger',
            pending: false,
            sent: 1,
            delivered: 1,
            read: 1,
            replied: 1,
            batch_count: 1,
            broadcast_date: new Date(),
            last_msg_date: new Date(),
            tracker_type: 'main',
            sender: agent_messenger_id,
            sender_url: agent_messenger_url,
            receiver: contact_messenger_id,
            receiver_url: contact_messenger_url,
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
        platform: 'fbmessenger',
        messenger_chat_id,
        campaign_name,
        agency_fk: agency_id,
        agency_user_fk: agency_user_id,
        contact_fk: contact_id,
        messenger_webhook_event_fk: event_id,
        msg_id: null,
        msg_type,
        msg_origin: 'user_message',
        msg_timestamp: timestamp,
        msg_body: content,
        media_url: content,
        content_type,
        file_name: filename,
        sender: agent_messenger_id,
        sender_url: agent_messenger_url,
        receiver: contact_messenger_id,
        receiver_url: contact_messenger_url,
        reply_to_event_id,
        reply_to_content,
        reply_to_msg_type,
        reply_to_contact_id,
        sent: 1,
        delivered: 1,
        failed: 0,
        read: 1,
        replied: 1,
        created_date_raw: new Date(),
        created_date: `${formattedDate} ${formattedTime}`,
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

      await h.fbmessenger.notifyMessageInteraction({
        agency_id: agency_id,
        agent_name: agency_user.user.dataValues.first_name,
        agent_email: agency_user.user.dataValues.email,
        additional_emails:
          agency_user.agency.dataValues.agency_campaign_additional_recipient,
        contact_name: fullName,
        msg: 'Document Message',
        msgType: msg_type,
        log,
      });
    } catch (err) {
      console.log(err);
    }
  };
  return messengerCtl;
};
