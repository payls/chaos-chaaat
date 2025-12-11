const constant = require('../../constants/constant.json');
const { Op } = require('sequelize');
const h = require('../../helpers');

module.exports = async ({ data, models, channel, config, pubChannel, log }) => {
  console.log(data);
  const { data: bulkCampaignData } = JSON.parse(data.content.toString());
  const amqProgressTrackerController =
    require('../../controllers/amqProgressTracker').makeController(models);
  const agencyChannelConfigCtl =
    require('../../controllers/agencyChannelConfig').makeController(models);
  const transaction = await models.sequelize.transaction();
  try {
    const {
      user_id,
      agency_id,
      assigned_tracker_ref_name,
      campaign_name,
      campaign_name_label,
      contact_ids,
      selected_line_channel,
      api_token,
      api_secret,
      templates,
      proposal,
      campaign_notification_additional_recipients,
    } = bulkCampaignData;
    const { sendLineCampaignQueue, sendLineCampaignRoutingKey } =
      config.amq.keys;
    const { SEND_LINE_CAMPAIGN } = constant.AMQ.CONSUMER_TYPES;

    const amq_progress_tracker_id = await amqProgressTrackerController.create(
      {
        agency_fk: agency_id,
        type: SEND_LINE_CAMPAIGN,
        total: contact_ids.length,
      },
      { transaction },
    );

    const agency = await models.agency.findOne({
      where: { agency_id },
    });

    const line_channel = await agencyChannelConfigCtl.findOne({
      agency_channel_config_id: selected_line_channel,
    });

    log.info(`Line campaign sending data: ${bulkCampaignData}`);

    if (Array.isArray(contact_ids)) {
      const broadcast_date = new Date();
      const tracker_ref_name =
        assigned_tracker_ref_name ||
        `${Date.now()}_line_campaign_${
          agency?.agency_name.replaceAll(' ', '_').toLowerCase() || 'agency'
        }`;
      const campaign_label = !h.isEmpty(campaign_name_label)
        ? campaign_name_label
        : campaign_name;

      for (const contact_id of contact_ids) {
        try {
          await channel.publish(
            sendLineCampaignQueue,
            sendLineCampaignRoutingKey,
            Buffer.from(
              JSON.stringify({
                consumerType: SEND_LINE_CAMPAIGN,
                data: {
                  agency,
                  line_channel,
                  broadcast_date,
                  tracker_ref_name,
                  user_id,
                  agency_id,
                  campaign_name,
                  campaign_label,
                  contact_id,
                  total: contact_ids.length,
                  selected_line_channel,
                  api_token,
                  api_secret,
                  templates,
                  proposal,
                  campaign_notification_additional_recipients,
                  amq_progress_tracker_id,
                },
              }),
            ),
          );
          log.info({
            consumerType: SEND_LINE_CAMPAIGN,
            data: {
              broadcast_date,
              agency,
              line_channel,
              user_id,
              agency_id,
              tracker_ref_name,
              campaign_name,
              campaign_label,
              contact_id,
              total: contact_ids.length,
              selected_line_channel,
              api_token,
              api_secret,
              templates,
              proposal,
              campaign_notification_additional_recipients,
              amq_progress_tracker_id,
            },
          });
          log.info(
            `Succeffully requested Line campaign sending for contact: ${contact_id}`,
          );
        } catch (err) {
          log.warn(
            `An error requesting Line campaign sending for contact: ${contact_id}`,
          );
          log.error(
            `Error log for contact ${contact_id} bulk Line campaign sending: ${err}`,
          );
        }
      }
    }
    await transaction.commit();
    if (channel && channel.ack) {
      log.info('Channel for acknowledgment');
      return await channel.ack(data);
    } else {
      log.error('Channel not available for acknowledgment');
      throw new Error('AMQ channel not available');
    }
  } catch (err) {
    log.error({
      err,
      channel,
    });
    await transaction.rollback();
    await channel.nack(data, false, false);
  }
};
