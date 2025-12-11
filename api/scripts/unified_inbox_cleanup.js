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
  await models.unified_inbox_2.create({
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

async function unifiedInboxCleanUp() {
  try {
    const whatsAppRecords = await models.whatsapp_message_tracker.findAll({
      where: {
        tracker_type: 'main',
      },
      order: [['created_date', 'DESC']],
    });
    for (const whatsapp of whatsAppRecords) {
      const unifiedInboxEntry = await models.unified_inbox_2.findOne({
        where: {
          contact_fk: whatsapp?.contact_fk,
          agency_fk: whatsapp?.agency_fk,
          msg_platform: 'whatsapp',
        },
      });

      if (h.isEmpty(unifiedInboxEntry)) {
        const record = await models.whatsapp_chat.findOne({
          where: {
            agency_fk: whatsapp?.agency_fk,
            contact_fk: whatsapp?.contact_fk,
            [Op.and]: sequelize.literal(
              "msg_type NOT IN ('frompave', 'img_frompave', 'file_frompave', 'video_frompave')",
            ),
          },
          order: [['created_date', 'DESC']],
          limit: 1,
        });

        let contactReplyMsg = whatsapp?.msg_body;
        if (record) {
          const record_type = record?.msg_type;
          switch (record_type) {
            case 'video':
              contactReplyMsg = 'Video Message';
              break;
            case 'image':
              contactReplyMsg = 'Photo Message';
              break;
            case 'document':
              contactReplyMsg = 'Document Message';
              break;
            case 'location':
              contactReplyMsg = 'Location Message';
              break;
            case 'audio':
              contactReplyMsg = 'Audio Message';
              break;
            case 'contact':
              contactReplyMsg = 'Contact Info Message';
              break;
            default:
              contactReplyMsg = record?.msg_body;
              break;
          }
        }

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
          msg_body: contactReplyMsg,
          msg_type: record ? record?.msg_type : 'frompave',
          batch_count: whatsapp?.batch_count,
          template_count: whatsapp?.template_count,
          tracker_type: 'main',
          pending: whatsapp?.pending,
          sent: whatsapp?.sent,
          delivered: whatsapp?.delivered,
          failed: 0,
          read: whatsapp?.read,
          replied: record ? 1 : 0,
          broadcast_date: whatsapp?.broadcast_date,
          last_msg_date: record ? record?.created_date : whatsapp?.created_date,
          visible: whatsapp?.visible,
          created_by: whatsapp?.created_by,
          created_date: record ? record?.created_date : whatsapp?.created_date,
          updated_by: whatsapp?.updated_by,
          updated_date: record ? record?.created_date : whatsapp?.created_date,
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
}

unifiedInboxCleanUp();
