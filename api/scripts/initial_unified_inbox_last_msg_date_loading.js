const models = require('../server/models');
const h = require('../server/helpers');
const sequelize = require('sequelize');
const { Op } = sequelize;

async function initialUnifiedInboxLastMsgDateLoad() {
  try {
    const whatsAppRecords = await models.whatsapp_message_tracker.findAll({
      where: {
        tracker_type: 'main',
      },
      order: [['created_date', 'ASC']],
    });
    for (const whatsapp of whatsAppRecords) {
      const chatRecord = await models.whatsapp_chat.findOne({
        where: {
          campaign_name: whatsapp?.campaign_name,
          contact_fk: whatsapp?.contact_fk,
          sender_number: whatsapp?.sender_number,
          receiver_number: whatsapp?.receiver_number,
        },
        order: [['created_date', 'DESC']],
      });

      if (chatRecord) {
        await models.unified_inbox.update(
          {
            last_msg_date: chatRecord.created_date,
          },
          {
            where: {
              tracker_id: whatsapp?.whatsapp_message_tracker_id,
              msg_platform: 'whatsapp',
            },
          },
        );
      }
    }
    const smsRecords = await models.sms_message_tracker.findAll({
      where: {
        msg_type: 'frompave',
      },
      order: [['created_date', 'ASC']],
    });
    for (const sms of smsRecords) {
      const chatRecord = await models.sms_message_tracker.findOne({
        where: {
          contact_fk: sms?.contact_fk,
          sender_number: sms?.sender_number,
          receiver_number: sms?.receiver_number,
        },
        order: [['created_date', 'DESC']],
      });
      if (chatRecord) {
        await models.unified_inbox.update(
          {
            last_msg_date: chatRecord.created_date,
          },
          {
            where: {
              tracker_id: sms?.sms_message_tracker_id,
              msg_platform: 'sms',
            },
          },
        );
      }
    }
  } catch (err) {
    console.error(err);
  }
}

initialUnifiedInboxLastMsgDateLoad();
