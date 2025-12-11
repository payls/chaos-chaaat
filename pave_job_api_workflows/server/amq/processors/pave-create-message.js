const constant = require('../../constants/constant.json');

module.exports = async ({ data, models, channel, config, pubChannel, log }) => {
  const { data: messageData } = JSON.parse(data.content.toString());
  const {
    campaign_name,
    user_id,
    contact_id,
    agency_user_id,
    sms: sendToSms,
    whatsApp: sendToWhatsApp,
    email: sendToEmail,
    amq_progress_tracker_id,
    agency_id,
    total,
    broadcast_date,
    tracker_ref_name,
    trigger_quick_reply,
    trigger_add_image,
    selected_images,
    templates,
    is_generic,
    is_template,
  } = messageData;
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
    const shortlistedProjectSettingControler =
      require('../../controllers/shortlistedProjectSetting').makeShortlistedProjectSettingController(
        models,
      );
    const whatsappMessageTrackerCtl =
      require('../../controllers/whatsappMessageTracker').makeController(
        models,
      );
    const ContactService = require('../../services/staff/contact');
    const contactService = new ContactService();
    const h = require('../../helpers');

    try {
      const agencyUser = await models.agency_user.findOne({
        where: {
          user_fk: user_id,
        },
        include: [{ model: models.agency, required: true }],
      });
      // update user
      const [
        { email, mobile_number, first_name, hubspot_bcc_id },
        {
          agency_fk,
          agency: { agency_name, agency_subdomain },
        },
        contactRecord,
      ] = await Promise.all([
        // Retrieve agency user details
        userController.findOne({ user_id }),
        // Retrieve agency detail
        agencyUserController.findOne(
          { user_fk: user_id },
          {
            include: [
              {
                model: models.agency,
                required: true,
              },
            ],
          },
        ),
        // Retrieve Buyer details
        contactController.findOne({ contact_id }),
      ]);

      // start sending proposal via email, whatsapp or sms
      // send permalink to email
      const buyerFirstName = contactRecord.first_name;
      const buyerEmail = contactRecord.email;

      // for send via whatsapp
      const contact_mobile_number = String(contactRecord.mobile_number);
      const buyerMobile = h.notEmpty(contact_mobile_number)
        ? contact_mobile_number.replace(/[^0-9]/g, '')
        : null;

      const agencyWhatsAppCredentials = h.notEmpty(
        agencyUser.agency.dataValues.agency_whatsapp_api_token,
      )
        ? agencyUser.agency.dataValues.agency_whatsapp_api_token +
          ':' +
          agencyUser.agency.dataValues.agency_whatsapp_api_secret
        : null;
      const agencyBufferedCredentials = h.notEmpty(agencyWhatsAppCredentials)
        ? Buffer.from(agencyWhatsAppCredentials, 'utf8').toString('base64')
        : null;

      if (sendToWhatsApp) {
        if (h.cmpBool(contactRecord.dataValues.opt_out_whatsapp, false)) {
          const { whatsapp_config } = await models.agency_config.findOne({
            where: { agency_fk: agency_id },
          });
          const config = JSON.parse(whatsapp_config);
          const environment = config.environment;
          if (is_generic) {
            if (trigger_add_image) {
              for (const image of selected_images) {
                const { fullImageMessageBody, imageSendPartData } =
                  await h.whatsapp.getProposalImageBody(buyerMobile, image);
                log.info({
                  action: 'WHATSAPP IMAGE DATA PARTS',
                  response: imageSendPartData,
                });

                // create whatsappMessageTracker
                const sendWhatsAppImageMessageResponse =
                  await h.whatsapp.sendWhatsAppMessage(
                    buyerMobile,
                    contactRecord.dataValues.is_whatsapp,
                    fullImageMessageBody,
                    imageSendPartData,
                    agencyBufferedCredentials,
                    environment,
                    log,
                  );
                // create transaction for whatsapp sending
                const send_whatsapp_generic_image_transaction =
                  await models.sequelize.transaction();
                try {
                  if (
                    !h.isEmpty(
                      sendWhatsAppImageMessageResponse.original_event_id,
                    )
                  ) {
                    log.info({
                      action: 'WHATSAPP IMAGE SENDING SUCCESS',
                      response: sendWhatsAppImageMessageResponse,
                    });
                    await whatsappMessageTrackerCtl.create(
                      {
                        campaign_name: campaign_name,
                        tracker_ref_name,
                        agency_fk: agency_id,
                        contact_fk: contact_id,
                        original_event_id:
                          sendWhatsAppImageMessageResponse.original_event_id,
                        msg_body:
                          sendWhatsAppImageMessageResponse.full_message_body,
                        pending: true,
                        batch_count: total,
                        created_by: user_id,
                        broadcast_date: new Date(broadcast_date),
                      },
                      { transaction: send_whatsapp_generic_image_transaction },
                    );
                    await contactController.update(
                      contact_id,
                      {
                        is_whatsapp: true,
                      },
                      { transaction: send_whatsapp_generic_image_transaction },
                    );
                  } else {
                    log.warn({
                      action: 'WHATSAPP IMAGE SENDING ERROR',
                      response: sendWhatsAppImageMessageResponse,
                    });
                    await whatsappMessageTrackerCtl.create(
                      {
                        campaign_name: campaign_name,
                        tracker_ref_name,
                        agency_fk: agency_id,
                        contact_fk: contact_id,
                        agency_user_fk: agency_user_id,
                        original_event_id:
                          sendWhatsAppImageMessageResponse.original_event_id,
                        msg_body:
                          sendWhatsAppImageMessageResponse.full_message_body,
                        pending: false,
                        failed: true,
                        batch_count: total,
                        created_by: user_id,
                        broadcast_date: new Date(broadcast_date),
                      },
                      { transaction: send_whatsapp_generic_image_transaction },
                    );
                  }
                  await send_whatsapp_generic_image_transaction.commit();
                } catch (triggerImageWhatsAppErr) {
                  log.error({
                    action: 'WHATSAPP MESSAGE IMAGE SENDING ERROR',
                    response: triggerImageWhatsAppErr,
                  });
                  await send_whatsapp_generic_image_transaction.rollback();
                  throw new Error('WHATSAPP MESSAGE IMAGE SENDING ERROR');
                }
              }
            }

            const { fullMessageBody, sendMessagePartsData } =
              await h.whatsapp.getProposalMessageBody(
                agency_name,
                h.general.prettifyConstant(first_name),
                buyerFirstName,
                buyerMobile, // To buyer whatsapp number
                null,
                trigger_quick_reply,
              );

            const sendWhatsAppMessageResponse =
              await h.whatsapp.sendWhatsAppMessage(
                buyerMobile,
                contactRecord.dataValues.is_whatsapp,
                fullMessageBody,
                sendMessagePartsData,
                agencyBufferedCredentials,
                environment,
                log,
              );
            // create whatsappMessageTracker for generic message
            const whatsapp_generic_message_sending_transaction =
              await models.sequelize.transaction();
            try {
              if (!h.isEmpty(sendWhatsAppMessageResponse.original_event_id)) {
                log.info({
                  action: 'WHATSAPP MESSAGE SENDING SUCCESS',
                  response: sendWhatsAppMessageResponse,
                });
                await whatsappMessageTrackerCtl.create(
                  {
                    campaign_name: campaign_name,
                    tracker_ref_name,
                    agency_fk: agency_id,
                    contact_fk: contact_id,
                    agency_user_fk: agency_user_id,
                    original_event_id:
                      sendWhatsAppMessageResponse.original_event_id,
                    msg_body: sendWhatsAppMessageResponse.full_message_body,
                    pending: true,
                    batch_count: total,
                    created_by: user_id,
                    broadcast_date: new Date(broadcast_date),
                  },
                  { transaction: whatsapp_generic_message_sending_transaction },
                );
                await contactController.update(
                  contact_id,
                  {
                    is_whatsapp: true,
                  },
                  { transaction: whatsapp_generic_message_sending_transaction },
                );
              } else {
                log.warn({
                  action: 'WHATSAPP MESSAGE SENDING ERROR',
                  response: sendWhatsAppMessageResponse,
                });
                await whatsappMessageTrackerCtl.create(
                  {
                    campaign_name: campaign_name,
                    tracker_ref_name,
                    agency_fk: agency_id,
                    contact_fk: contact_id,
                    agency_user_fk: agency_user_id,
                    original_event_id:
                      sendWhatsAppMessageResponse.original_event_id,
                    msg_body: sendWhatsAppMessageResponse.full_message_body,
                    pending: false,
                    failed: true,
                    batch_count: total,
                    created_by: user_id,
                    broadcast_date: new Date(broadcast_date),
                  },
                  { transaction: whatsapp_generic_message_sending_transaction },
                );
              }
              await whatsapp_generic_message_sending_transaction.commit();
            } catch (triggerGenericMessageErr) {
              log.error({
                action: 'WHATSAPP GENERIC MESSAGE SENDING ERROR',
                response: triggerGenericMessageErr,
              });
              await whatsapp_generic_message_sending_transaction.rollback();
              throw new Error('WHATSAPP GENERIC MESSAGE SENDING ERROR');
            }
          } else {
            const template_count = templates.reduce((pv, cv) => {
              if (h.cmpBool(cv.selected, true)) pv += 1;
              return pv;
            }, 0);
            console.log(`template count ${template_count}`);
            for (const i in templates) {
              const template = templates[i];
              if (h.cmpBool(template.selected, true)) {
                const { sendMessagePartsData } =
                  await h.whatsapp.getProposalTemplateBody(
                    agency_name,
                    h.general.prettifyConstant(first_name),
                    buyerFirstName,
                    buyerMobile, // To buyer whatsapp number
                    null,
                    template,
                  );

                const sendWhatsAppTemplateMessageResponse =
                  await h.whatsapp.sendWhatsAppTemplateMessage(
                    buyerMobile,
                    contactRecord.dataValues.is_whatsapp,
                    null,
                    sendMessagePartsData,
                    agencyBufferedCredentials,
                    environment,
                    log,
                  );
                const permalink_url = h.cmpStr(
                  process.env.NODE_ENV,
                  'development',
                )
                  ? 'https://samplerealestateagency.yourpave.com/Samplerealestateagency-Proposal-for-IAN-gzc72sna'
                  : null;

                // create whatsapp template sending transaction
                const whatsapp_template_message_sending_transaction =
                  await models.sequelize.transaction();

                try {
                  for (const component of template.components) {
                    if (h.cmpStr(component.type, 'BODY')) {
                      let msg_body = component.text;
                      if (typeof component.example !== 'undefined') {
                        const examples =
                          component.example.body_text.length > 0
                            ? component.example.body_text[0]
                            : [];
                        examples.forEach((ex, index) => {
                          if (template.body_component[index] !== 'undefined') {
                            if (template.body_component[index] === 'agency') {
                              msg_body = msg_body.replace(
                                `{{${index + 1}}}`,
                                h.general.prettifyConstant(first_name),
                              );
                            } else if (
                              template.body_component[index] === 'link'
                            ) {
                              msg_body = msg_body.replace(
                                `{{${index + 1}}}`,
                                permalink_url,
                              );
                            } else {
                              msg_body = msg_body.replace(
                                `{{${index + 1}}}`,
                                buyerFirstName,
                              );
                            }
                          } else {
                            msg_body = msg_body.replace(
                              `{{${index + 1}}}`,
                              buyerFirstName,
                            );
                          }
                        });
                      }
                      await whatsappMessageTrackerCtl.create(
                        {
                          campaign_name: campaign_name,
                          tracker_ref_name,
                          agency_fk: agency_id,
                          contact_fk: contact_id,
                          agency_user_fk: agency_user_id,
                          original_event_id:
                            sendWhatsAppTemplateMessageResponse.original_event_id,
                          msg_body: msg_body,
                          pending: !h.isEmpty(
                            sendWhatsAppTemplateMessageResponse.original_event_id,
                          ),
                          failed: h.isEmpty(
                            sendWhatsAppTemplateMessageResponse.original_event_id,
                          ),
                          batch_count: total,
                          created_by: user_id,
                          broadcast_date: new Date(broadcast_date),
                          template_count: template_count,
                          tracker_type: h.cmpInt(i, 0) ? 'main' : 'sub',
                        },
                        {
                          transaction:
                            whatsapp_template_message_sending_transaction,
                        },
                      );
                    }
                  }
                  if (
                    !h.isEmpty(
                      sendWhatsAppTemplateMessageResponse.original_event_id,
                    )
                  ) {
                    await contactController.update(
                      contact_id,
                      {
                        is_whatsapp: true,
                      },
                      {
                        transaction:
                          whatsapp_template_message_sending_transaction,
                      },
                    );
                  }
                  await whatsapp_template_message_sending_transaction.commit();
                } catch (triggerTemplateMessageErr) {
                  log.error({
                    action: 'WHATSAPP TEMPLATE MESSAGE SENDING ERROR',
                    response: triggerTemplateMessageErr,
                  });
                  await whatsapp_template_message_sending_transaction.rollback();
                  throw new Error('WHATSAPP TEMPLATE MESSAGE SENDING ERROR');
                }
              }
            }
          }
        }
      }
      // contact update transaction
      const amq_transaction = await models.sequelize.transaction();
      try {
        await amqProgressTrackerController.addSuccess(
          amq_progress_tracker_id,
          1,
          { transaction: amq_transaction },
        );
        await amq_transaction.commit();
      } catch (amqUpdateErr) {
        log.error({
          action: 'AMQ TRANSACTION ERROR',
          response: amqUpdateErr,
        });
        await amq_transaction.rollback();
        throw new Error('AMQ TRANSACTION ERROR');
      }
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
        consumer: 'PAVE_CREATE_MESSAGE',
      });
      await amqProgressTrackerController.addError(amq_progress_tracker_id, 1);
      return await channel.nack(data, false, false);
    }
  } catch (mainErr) {
    log.error({
      err: mainErr,
      consumer: 'PAVE_CREATE_MESSAGE',
    });
    await amqProgressTrackerController.addError(amq_progress_tracker_id, 1);
    return await channel.nack(data, false, false);
  }
};
