const constant = require('../../constants/constant.json');
const { Op } = require('sequelize');
const h = require('../../helpers');

module.exports = async ({ data, models, channel, config, pubChannel, log }) => {
  const { data: bulkMessageData } = JSON.parse(data.content.toString());
  const amqProgressTrackerController =
    require('../../controllers/amqProgressTracker').makeController(models);
  const campaignCtaCtl =
    require('../../controllers/campaignCta').makeController(models);
  const transaction = await models.sequelize.transaction();
  try {
    const {
      contact_ids,
      campaign_name,
      agency_id,
      user_id,
      sms,
      whatsApp,
      email,
      trigger_quick_reply,
      trigger_add_image,
      selected_images,
      templates,
      is_generic,
      is_template,
    } = bulkMessageData;

    const { paveCreateMessageQueue, paveCreateMessageRoutingKey } =
      config.amq.keys;
    const { PAVE_CREATE_MESSAGE } = constant.AMQ.CONSUMER_TYPES;
    const amq_progress_tracker_id = await amqProgressTrackerController.create({
      agency_fk: agency_id,
      type: PAVE_CREATE_MESSAGE,
      total: contact_ids.length,
    });

    const agency = await models.agency.findOne({
      where: { agency_id },
    });

    const agencyUser = await models.agency_user.findOne({
      where: {
        agency_fk: agency_id,
        user_fk: user_id,
      },
    });

    log.info(`Message sending data: ${bulkMessageData}`);

    if (Array.isArray(contact_ids)) {
      const broadcast_date = new Date();
      const tracker_ref_name = `${Date.now()}_bulkmessage_${
        agency?.agency_name.replaceAll(' ', '_').toLowerCase() || 'agency'
      }`;
      const cta = [];
      if (is_template) {
        for (const i in templates) {
          const template = templates[i];
          if (h.cmpBool(template.selected, true)) {
            template.components.forEach((component) => {
              if (h.cmpStr(component.type, 'BUTTONS')) {
                component.buttons.forEach((btn, index) => {
                  if (h.cmpStr(btn.type, 'QUICK_REPLY')) {
                    cta.push(btn.text);
                  }
                });
              }
            });
          }
        }
      }
      if (!h.isEmpty(cta)) {
        // create campaign cta reference
        const campaing_cta_transaction = await models.sequelize.transaction();
        await campaignCtaCtl.create(
          {
            campaign_tracker_ref_name: tracker_ref_name,
            cta_1: cta[0],
            cta_2: cta[1],
            cta_3: cta[2],
          },
          { transaction: campaing_cta_transaction },
        );
        await campaing_cta_transaction.commit();
      }
      for (const contact_id of contact_ids) {
        try {
          await channel.publish(
            paveCreateMessageQueue,
            paveCreateMessageRoutingKey,
            Buffer.from(
              JSON.stringify({
                consumerType: PAVE_CREATE_MESSAGE,
                data: {
                  campaign_name,
                  contact_id,
                  user_id,
                  agency_user_id: agencyUser.agency_user_id,
                  sms,
                  whatsApp,
                  email,
                  amq_progress_tracker_id,
                  total: contact_ids.length,
                  agency_id,
                  broadcast_date,
                  tracker_ref_name,
                  trigger_quick_reply,
                  trigger_add_image,
                  selected_images,
                  templates,
                  is_generic,
                  is_template,
                },
              }),
            ),
          );
          log.info(
            `Succeffully requested message sending for contact: ${contact_id}`,
          );
        } catch (err) {
          log.warn(
            `An error requesting message sending for contact: ${contact_id}`,
          );
          log.error(
            `Error log for contact ${contact_id} bulk message sending: ${err}`,
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
