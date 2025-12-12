const models = require('../server/models');
const h = require('../server/helpers');
const sequelize = require('sequelize');
const { Op } = sequelize;

const agency_id = 'b07cac2d-7e95-40e4-a9f1-e7c9e6061911';
const tracker_ref_name = '1681894997729_bulkproposal_breathe_pilates';
const campaign_name =
  'Breathe Pilates Campaign Complimentary Movement Assessment Apr 19';

async function tracker_check() {
  const tracker_data = await models.whatsapp_message_tracker.findAll({
    where: {
      agency_fk: agency_id,
      tracker_ref_name: tracker_ref_name,
      campaign_name: campaign_name,
    },
  });

  for (const data of tracker_data) {
    const chat_data = await models.whatsapp_chat.findOne({
      where: {
        agency_fk: agency_id,
        original_event_id: data?.original_event_id,
        campaign_name: campaign_name,
      },
    });
    if (!chat_data) {
      const whatsapp_chat_id = h.general.generateId();
      const timestamp = Math.floor(data?.created_date.getTime() / 1000);

      await models.whatsapp_chat.create({
        whatsapp_chat_id: whatsapp_chat_id,
        agency_fk: data?.agency_fk,
        campaign_name: data?.campaign_name,
        agency_user_fk: data?.agency_user_fk,
        contact_fk: data?.contact_fk,
        msg_id: data?.msg_id,
        msg_body: data?.msg_body,
        original_event_id: data?.original_event_id,
        msg_type: 'frompave',
        msg_origin: 'campaign',
        msg_timestamp: timestamp,
        created_date: data?.created_date,
        sender_number: data?.sender_number,
        sender_url: data?.sender_url,
        receiver_number: data?.receiver_number,
        receiver_url: data?.receiver_url,
        sent: data?.sent,
        delivered: data?.delivered,
        read: data?.read,
        failed: data?.failed,
      });
    }
  }
}

tracker_check();
