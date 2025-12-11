const models = require('../server/models');
const h = require('../server/helpers');
const sequelize = require('sequelize');
const { Op } = sequelize;

async function createUnifiedRecord({
  tracker_id,
  tracker_ref_name,
  campaign_name,
  agency_fk,
  contact_fk,
  agency_user_fk,
  event_id,
  msg_platform,
  sender_number: sender,
  sender_url,
  receiver_number: receiver,
  receiver_url,
  msg_body,
  msg_type,
  batch_count,
  template_count,
  tracker_type,
  pending,
  sent,
  delivered,
  failed,
  read,
  replied,
  broadcast_date,
  last_msg_date,
  visible,
  created_by,
  created_date,
  updated_by,
  updated_date,
}) {
  const unified_inbox_id = h.general.generateId();
  await models.unified_inbox.create({
    unified_inbox_id,
    tracker_id,
    tracker_ref_name,
    campaign_name,
    agency_fk,
    contact_fk,
    agency_user_fk,
    event_id,
    msg_platform,
    sender,
    sender_url,
    receiver,
    receiver_url,
    msg_body,
    msg_type,
    batch_count,
    template_count,
    tracker_type,
    pending,
    sent,
    delivered,
    failed,
    read,
    replied,
    broadcast_date,
    last_msg_date,
    visible,
    created_by,
    created_date,
    updated_by,
    updated_date,
  });
}

async function initialUnifiedInboxLoad() {
  try {
    const whatsAppRecords = await models.whatsapp_message_tracker.findAll();
    for (const whatsapp of whatsAppRecords) {
      const unifiedInboxEntry = await models.unified_inbox.findOne({
        where: {
          tracker_id: whatsapp?.whatsapp_message_tracker_id,
          msg_platform: 'whatsapp',
        },
      });

      if (h.isEmpty(unifiedInboxEntry)) {
        const record = await models.whatsapp_chat.findOne({
          where: {
            agency_fk: whatsapp?.agency_fk,
            contact_fk: whatsapp?.contact_fk,
          },
          order: [['created_date', 'DESC']],
          limit: 1,
        });
        await createUnifiedRecord({
          tracker_id: whatsapp?.whatsapp_message_tracker_id,
          tracker_ref_name: whatsapp?.tracker_ref_name,
          campaign_name: whatsapp?.campaign_name,
          agency_fk: whatsapp?.agency_fk,
          contact_fk: whatsapp?.contact_fk,
          agency_user_fk: whatsapp?.agency_user_fk,
          event_id: whatsapp?.original_event_id,
          msg_platform: 'whatsapp',
          sender_number: whatsapp?.sender_number,
          sender_url: whatsapp?.sender_url,
          receiver_number: whatsapp?.receiver_number,
          receiver_url: whatsapp?.receiver_url,
          msg_body: whatsapp?.msg_body,
          msg_type: 'frompave',
          batch_count: whatsapp?.batch_count,
          template_count: whatsapp?.template_count,
          tracker_type: whatsapp?.tracker_type,
          pending: whatsapp?.pending,
          sent: whatsapp?.sent,
          delivered: whatsapp?.delivered,
          failed: whatsapp?.failed,
          read: whatsapp?.read,
          replied: whatsapp?.replied,
          broadcast_date: whatsapp?.broadcast_date,
          last_msg_date: record
            ? record?.created_date
            : whatsapp?.broadcast_date,
          visible: whatsapp?.visible,
          created_by: whatsapp?.created_by,
          created_date: whatsapp?.created_date,
          updated_by: whatsapp?.updated_by,
          updated_date: whatsapp?.updated_date,
        });
      }
    }

    const smsRecords = await models.sms_message_tracker.findAll({
      where: {
        msg_type: 'frompave',
      },
    });
    for (const sms of smsRecords) {
      const unifiedInboxEntry = await models.unified_inbox.findOne({
        where: {
          tracker_id: sms?.sms_message_tracker_id,
          msg_platform: 'sms',
        },
      });
      if (h.isEmpty(unifiedInboxEntry)) {
        const record = await models.sms_message_tracker.findOne({
          where: {
            agency_fk: sms?.agency_fk,
            contact_fk: sms?.contact_fk,
          },
          order: [['created_date', 'DESC']],
          limit: 1,
        });
        await createUnifiedRecord({
          tracker_id: sms?.sms_message_tracker_id,
          tracker_ref_name: sms?.tracker_ref_name,
          campaign_name: sms?.campaign_name,
          agency_fk: sms?.agency_fk,
          contact_fk: sms?.contact_fk,
          agency_user_fk: sms?.agency_user_fk,
          event_id: sms?.account_sid,
          msg_platform: 'sms',
          sender_number: sms?.sender_number,
          sender_url: sms?.sender_url,
          receiver_number: sms?.receiver_number,
          receiver_url: sms?.receiver_url,
          msg_body: sms?.msg_body,
          msg_type: 'frompave',
          batch_count: sms?.batch_count,
          template_count: sms?.template_count,
          tracker_type: sms?.tracker_type,
          pending: 0,
          sent: sms?.sent,
          delivered: sms?.delivered,
          failed: sms?.failed,
          read: 0,
          replied: sms?.replied,
          broadcast_date: null,
          last_msg_date: record ? record?.created_date : sms?.created_date,
          visible: 1,
          created_by: sms?.created_by,
          created_date: sms?.created_date,
          updated_by: sms?.updated_by,
          updated_date: sms?.updated_date,
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
}

initialUnifiedInboxLoad();
