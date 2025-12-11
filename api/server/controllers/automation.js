const Sentry = require('@sentry/node');
const h = require('../helpers');
const { Op } = require('sequelize');
const moment = require('moment');
const MindBodyAPI = require('../services/mindBodyApi');
const ContactService = require('../services/staff/contact');
const contactService = new ContactService();
const constant = require('../constants/constant.json');

module.exports.makeController = (models) => {
  const automationRuleCtlr = require('./automationRule').makeController(models);
  const contactCtlr = require('./contact').makeContactController(models);
  const mindbodyMembershipCtlr =
    require('./mindbodyClientMembership').makeController(models);
  const mindBodyClientVisitCtlr =
    require('./mindbodyClientVisit').makeController(models);
  const mindBodyClientServicesCtlr =
    require('./mindbodyClientServices').makeController(models);
  const mindBodyClientContractCtlr =
    require('./mindbodyClientContract').makeController(models);
  const automationRuleTemplateCtr =
    require('./automationRuleTemplate').makeController(models);
  const wabaTemplateCtr = require('./wabaTemplate').makeController(models);
  const agencyCtr = require('./agency').makeAgencyController(models);
  const agencyWhatsAppConfigCtr =
    require('./agencyWhatsappConfig').makeController(models);
  const whatsappMessageTrackerCtr =
    require('./whatsappMessageTracker').makeController(models);
  const unifiedInboxCtr = require('./unifiedInbox').makeController(models);
  const agencyOauthCtlr = require('./agencyOauth').makeController(models);
  const contactSrcCtlr =
    require('./contactSource').makeContactSourceController(models);
  const hubSpotFormSubmissionsCtlr =
    require('./hubSpotFormSubmissions').makeController(models);
  const campaignCtaCtl = require('./campaignCta').makeController(models);
  const agencyConfigCtl = require('./agencyConfig').makeController(models);
  const whatsAppChatCtr = require('./whatsappChat').makeController(models);
  const contactSalesforceData =
    require('./contactSalesforceData').makeController(models);
  const messageInventory = require('./messageInventory').makeController(models);
  const appSyncCredentials = require('./appSyncCredentials').makeController(
    models,
  );
  const agencyNotification = require('./agencyNotification').makeController(
    models,
  );

  const ctlr = {};

  ctlr.run = async (encryptionKeys) => {
    /** Get all active rules */
    const rules = await automationRuleCtlr.findAll(
      { status: 'active' },
      {
        include: [
          {
            model: models.automation_rule_template,
          },
          {
            model: models.automation_rule_packages,
            include: [
              {
                model: models.mindbody_packages,
              },
            ],
          },
          {
            model: models.automation_rule_form,
            include: [
              {
                model: models.hubspot_form,
              },
            ],
          },
          {
            model: models.automation_category,
          },
        ],
      },
    );

    if (h.notEmpty(rules)) {
      for (const rule of rules) {
        switch (rule.rule_trigger_fk) {
          /**
           * MINDBODY AUTOMATION
           */
          // Message contact after registration
          case 'da7875aa-7e42-4260-8941-02ba9b90e0e3': {
            await messageContactAfterRegistration(rule, encryptionKeys);
            break;
          }

          // Message contact after purchase
          case 'da7875aa-7e42-4260-8941-02ba9b90e0e4': {
            await messageContactAfterPurchase(rule, encryptionKeys);
            break;
          }

          /**
           * HUBSPOT AUTOMATION
           */
          // Message contact after form submissions
          case 'da7875aa-7e42-4260-8941-02ba9b90e0d1': {
            await messageContactAfterFormSubmissions(rule, encryptionKeys);
            break;
          }
        }
      }
    }

    return rules;
  };

  ctlr.messageClientForFirstBooking = async (
    clientId,
    appointmentPayload,
    agency_fk,
    encryptionKeys,
  ) => {
    const { itemId, itemName } = appointmentPayload;

    const mindBodySetting = await agencyOauthCtlr.findOne({
      source: 'MINDBODY',
      status: 'active',
      agency_fk,
    });

    if (h.isEmpty(mindBodySetting)) {
      return;
    }

    const rule = await automationRuleCtlr.findOne(
      {
        rule_trigger_fk: 'da7875aa-7e42-4260-8941-02ba9b90e0e8',
        status: 'active',
      },
      {
        include: [
          {
            model: models.automation_rule_template,
          },
          {
            model: models.automation_rule_packages,
            include: [
              {
                model: models.mindbody_packages,
              },
            ],
          },
          {
            model: models.automation_category,
            required: true,
            where: {
              agency_fk,
            },
          },
        ],
      },
    );

    const contactSrc = await contactSrcCtlr.findOne({
      source_contact_id: clientId,
    });

    if (h.isEmpty(contactSrc)) {
      return;
    }

    if (h.notEmpty(rule?.automation_rule_packages)) {
      for (const pckg of rule?.automation_rule_packages) {
        if (pckg.dataValues.mindbody_package) {
          if (pckg.dataValues.mindbody_package.name === itemName) {
            const contact = await contactCtlr.findOne(
              {
                contact_id: contactSrc.contact_fk,
                agency_fk,
                [Op.or]: [
                  {
                    whatsapp_engagement: 'all',
                  },
                  {
                    whatsapp_engagement: {
                      [Op.like]: `%automation%`,
                    },
                  },
                ],
              },
              {
                include: [
                  {
                    model: models.agency_user,
                    required: true,
                  },
                  {
                    model: models.mindbody_client_visits,
                    where: {
                      [Op.and]: [
                        {
                          payload: {
                            [Op.like]: `%"ServiceName":"${itemName}"%`,
                          },
                        },
                        {
                          payload: {
                            [Op.like]: `%"ClientUniqueId":${clientId}%`,
                          },
                        },
                        {
                          payload: {
                            [Op.like]: `%"AppointmentStatus":"Booked"%`,
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            );

            // check if for any business initiated message for first time booking
            const firsTimeBookingMessage =
              await whatsappMessageTrackerCtr.findOne({
                contact_fk: contactSrc.contact_fk,
                agency_fk,
                msg_id: rule?.automation_rule_id,
              });

            if (
              h.notEmpty(contact) &&
              h.notEmpty(contact.mindbody_client_visits) &&
              h.isEmpty(firsTimeBookingMessage)
            ) {
              if (contact.mindbody_client_visits.length === 1) {
                const visitObject = JSON.parse(
                  contact.mindbody_client_visits[0].payload,
                );

                const todayDate = moment().format('YYYY-MM-DD');
                const pastDate = moment(visitObject.EndDateTime).format(
                  'YYYY-MM-DD',
                );
                if (todayDate <= pastDate) {
                  console.log('Sending message...');
                  const agency = agencyCtr.findOne({ agency_id: agency_fk });
                  const agencyRecord = agency.dataValues;
                  const campaign_name = `Automated Message ${agency_fk} ${Date.now()}`;
                  const tracker_ref_name = `${agency_fk}_${Date.now()}_automation_${
                    agencyRecord?.agency_name
                      .replaceAll(' ', '_')
                      .toLowerCase() || 'agency'
                  }`;
                  await sendWhatsAppMessage(
                    contact.contact_id,
                    rule.automation_rule_id,
                    campaign_name,
                    tracker_ref_name,
                    '',
                    encryptionKeys,
                  );
                  console.log('Sending done.');
                }
              }
            }
          }
        }
      }
    }
  };

  ctlr.messageClientAttendedFirstBooking = async (
    clientId,
    appointmentPayload,
    agency_fk,
    encryptionKeys,
  ) => {
    const { itemId, itemName, hasArrived } = appointmentPayload;

    if (!hasArrived) {
      return;
    }

    const mindBodySetting = await agencyOauthCtlr.findOne({
      source: 'MINDBODY',
      status: 'active',
      agency_fk,
    });

    if (h.isEmpty(mindBodySetting)) {
      return;
    }

    const rule = await automationRuleCtlr.findOne(
      {
        rule_trigger_fk: 'da7875aa-7e42-4260-8941-02ba9b90e0e9',
        status: 'active',
      },
      {
        include: [
          {
            model: models.automation_rule_template,
          },
          {
            model: models.automation_rule_packages,
            include: [
              {
                model: models.mindbody_packages,
              },
            ],
          },
          {
            model: models.automation_category,
            required: true,
            where: {
              agency_fk,
            },
          },
        ],
      },
    );

    const contactSrc = await contactSrcCtlr.findOne({
      source_contact_id: clientId,
    });

    if (h.isEmpty(contactSrc)) {
      return;
    }
    const todayDate = moment().format('YYYY-MM-DD');
    if (h.notEmpty(rule?.automation_rule_packages)) {
      for (const pckg of rule?.automation_rule_packages) {
        if (pckg.dataValues.mindbody_package) {
          if (pckg.dataValues.mindbody_package.name === itemName) {
            const contact = await contactCtlr.findOne(
              {
                contact_id: contactSrc.contact_fk,
                agency_fk,
                [Op.or]: [
                  {
                    whatsapp_engagement: 'all',
                  },
                  {
                    whatsapp_engagement: {
                      [Op.like]: `%automation%`,
                    },
                  },
                ],
              },
              {
                include: [
                  {
                    model: models.agency_user,
                    required: true,
                  },
                  {
                    model: models.mindbody_client_visits,
                    where: {
                      [Op.and]: [
                        {
                          payload: {
                            [Op.like]: `%"ServiceName":"${itemName}"%`,
                          },
                        },
                        {
                          payload: {
                            [Op.like]: `%"ClientUniqueId":${clientId}%`,
                          },
                        },
                        {
                          payload: {
                            [Op.like]: `%"AppointmentStatus":"Arrived"%`,
                          },
                        },
                        {
                          payload: {
                            [Op.like]: `%"EndDateTime":"${todayDate}%`,
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            );

            // check for any business initiated message for first time attend booking
            const firsTimeAttendedBookingMessage =
              await whatsappMessageTrackerCtr.findOne({
                contact_fk: contactSrc.contact_fk,
                agency_fk,
                msg_id: rule?.automation_rule_id,
              });

            if (
              h.notEmpty(contact) &&
              h.notEmpty(contact.mindbody_client_visits) &&
              h.isEmpty(firsTimeAttendedBookingMessage)
            ) {
              if (contact.mindbody_client_visits.length === 1) {
                console.log('Sending message...');
                const agency = agencyCtr.findOne({ agency_id: agency_fk });
                const agencyRecord = agency.dataValues;
                const campaign_name = `Automated Message ${agency_fk} ${Date.now()}`;
                const tracker_ref_name = `${agency_fk}_${Date.now()}_automation_${
                  agencyRecord?.agency_name
                    .replaceAll(' ', '_')
                    .toLowerCase() || 'agency'
                }`;
                await sendWhatsAppMessage(
                  contact.contact_id,
                  rule.automation_rule_id,
                  campaign_name,
                  tracker_ref_name,
                  '',
                  encryptionKeys,
                );
                console.log('Sending done.');
              }
            }
          }
        }
      }
    }
  };

  ctlr.runOnce = async (encryptionKeys) => {
    /** Get all active rules */
    const rules = await automationRuleCtlr.findAll(
      { status: 'active' },
      {
        include: [
          {
            model: models.automation_rule_template,
          },
          {
            model: models.automation_rule_packages,
            include: [
              {
                model: models.mindbody_packages,
              },
            ],
          },
          {
            model: models.automation_category,
          },
        ],
      },
    );

    if (h.notEmpty(rules)) {
      for (const rule of rules) {
        switch (rule.rule_trigger_fk) {
          // Message contact after expiration day
          case 'da7875aa-7e42-4260-8941-02ba9b90e0e5': {
            await messageContactAfterExpiration(rule, encryptionKeys);
            break;
          }

          // Message contact before expiration day
          case 'da7875aa-7e42-4260-8941-02ba9b90e0e6': {
            await messageContactBeforeExpiration(rule, encryptionKeys);
            break;
          }

          // Client hasn't taken a class in X days/weeks of claiming Trial Offer
          case 'da7875aa-7e42-4260-8941-02ba9b90e0e7': {
            await messageContactHaventTakenAClass(rule, encryptionKeys);
            break;
          }
        }
      }
    }

    return rules;
  };

  ctlr.syncContacts = async (agency_fk) => {
    const mindBodySetting = await agencyOauthCtlr.findOne({
      source: 'MINDBODY',
      status: 'active',
      agency_fk,
    });

    if (h.isEmpty(mindBodySetting)) {
      return;
    }
    const { access_info } = mindBodySetting;

    const accessInfo = JSON.parse(access_info);
    const { siteId, apiKey, staffUsername, staffPassword } = accessInfo;
    const mindbodyApi = new MindBodyAPI(siteId, apiKey);

    const staffRes = await mindbodyApi.getStaffToken(
      staffUsername,
      staffPassword,
    );

    try {
      let pageSize = 0;
      let offset = 0;
      const limit = 100;
      const contacts = [];

      // Get MB Client Info
      const clients = await mindbodyApi.getAllClients(
        {
          limit,
          offset,
        },
        staffRes.AccessToken,
      );
      if (clients.Clients.length > 0) {
        if (clients.PaginationResponse.PageSize > 0) {
          pageSize = clients.PaginationResponse.PageSize;

          // Add first page
          for (const client of clients.Clients) {
            const cs = await contactSrcCtlr.findOne({
              source_contact_id: client.Id,
            });

            if (h.isEmpty(cs)) {
              contacts.push(getContactDetails(client));
            }
          }

          if (pageSize > 1) {
            for (let i = 0; i < pageSize - 1; i++) {
              offset += limit;
              const otherClients = await mindbodyApi.getAllClients(
                {
                  limit,
                  offset,
                  searchText: 'Ian',
                },
                staffRes.AccessToken,
              );
              console.log({
                limit,
                offset,
              });

              for (const otherClient of otherClients.Clients) {
                const cs = await contactSrcCtlr.findOne({
                  source_contact_id: otherClient.Id,
                });

                if (h.isEmpty(cs)) {
                  contacts.push(getContactDetails(otherClient));
                }
              }
            }
          }
        }
      }
      // console.log(contacts);
      return contacts;
    } catch (err) {
      Sentry.captureException(err);
      return null;
    }
  };

  ctlr.runImmediateForSubmission = async (
    formId,
    contactId,
    triggerId,
    encryptionKeys,
  ) => {
    console.log('💥💥💥💥💥💥💥START AUTOMATION LOG💥💥💥💥💥💥💥');
    console.log(
      '💥💥💥💥💥💥💥 Message contact after for submission 💥💥💥💥💥💥💥',
    );
    const rule = await automationRuleCtlr.findOne(
      {
        rule_trigger_fk: triggerId,
        status: 'active',
        rule_trigger_setting: 'immediately',
      },
      {
        include: [
          {
            model: models.automation_rule_template,
          },
          {
            model: models.automation_rule_packages,
            include: [
              {
                model: models.mindbody_packages,
              },
            ],
          },
          {
            model: models.automation_rule_form,
            required: true,
            where: {
              form_fk: formId,
            },
          },
          {
            model: models.automation_category,
          },
        ],
      },
    );

    if (h.notEmpty(rule?.automation_rule_form)) {
      const submission = await hubSpotFormSubmissionsCtlr.findOne(
        {
          hubspot_form_fk: rule?.automation_rule_form.dataValues.form_fk,
          status: {
            [Op.in]: ['create', 'update'],
          },
        },
        {
          include: [
            {
              model: models.contact,
              required: true,
              where: {
                contact_id: contactId,
              },
            },
          ],
          order: 'created_date',
        },
      );
      console.log('💥💥💥💥💥💥💥GET SUBMISSION💥💥💥💥💥💥💥');
      console.log(submission);
      console.log('💥💥💥💥💥💥💥💥💥💥💥💥💥💥');
      if (h.notEmpty(submission)) {
        console.log({
          contact_id: submission.contact.contact_id,
          rule_id: rule.automation_rule_id,
          executionDateTime: 'now',
        });
        const agencyId = submission.contact.agency_fk;
        const agency = agencyCtr.findOne({ agency_id: agencyId });
        const agencyRecord = agency.dataValues;
        const campaign_name = `Automated Message ${agencyId} ${Date.now()}`;
        const tracker_ref_name = `${agencyId}_${Date.now()}_automation_${
          agencyRecord?.agency_name.replaceAll(' ', '_').toLowerCase() ||
          'agency'
        }`;

        const { agency_config_id, whatsapp_config } =
          await models.agency_config.findOne({
            where: { agency_fk: agencyId },
          });
        const wa_config = JSON.parse(whatsapp_config);
        console.log(wa_config);
        let saved_quick_replies = !h.isEmpty(wa_config.quick_replies)
          ? wa_config.quick_replies
          : [];
        const new_whatsapp_config = {
          is_enabled: wa_config.is_enabled,
          environment: wa_config.environment,
          quick_replies: saved_quick_replies,
        };

        // setup messaging config
        const cta = [];
        const automation_template = await automationRuleTemplateCtr.findOne({
          automation_rule_fk: rule.automation_rule_id,
        });

        const waba_template = await wabaTemplateCtr.findOne({
          waba_template_id: automation_template.template_fk,
        });

        // console.log(waba_template);
        const template = waba_template.dataValues;
        const selected_template = JSON.parse(template.content);
        const cta_option_type = [];
        for (let index = 1; index <= 10; index++) {
          cta_option_type.push(automation_template[`cta_${index}_option_type`]);
        }
        selected_template.components.forEach((component) => {
          if (h.cmpStr(component.type, 'BUTTONS')) {
            let qr_index = 0;
            component.buttons.forEach((btn, index) => {
              if (h.cmpStr(btn.type, 'QUICK_REPLY')) {
                cta.push(btn.text);
                saved_quick_replies = h.whatsapp.checkIfQRIsCheckedAnMonitored(
                  cta_option_type[qr_index],
                  btn.text,
                  saved_quick_replies,
                );
                qr_index++;
              }
            });
          }
        });

        if (!h.isEmpty(cta)) {
          console.log(cta);
          new_whatsapp_config.quick_replies = saved_quick_replies;
          await agencyConfigCtl.update(agency_config_id, {
            whatsapp_config: JSON.stringify(new_whatsapp_config),
          });
          const campaignCtaData = {
            campaign_tracker_ref_name: tracker_ref_name,
            campaign_notification_additional_recipients: null,
            is_confirmation: false,
          };

          for (let index = 0; index < 10; index++) {
            campaignCtaData[`cta_${index + 1}`] = !h.isEmpty(cta[index])
              ? cta[index]
              : null;
            campaignCtaData[`cta_${index + 1}_response`] =
              automation_template[`cta_${index + 1}_response`];
            campaignCtaData[`trigger_cta_${index + 1}_options`] =
              automation_template[`trigger_cta_${index + 1}_options`];
            campaignCtaData[`cta_${index + 1}_final_response`] =
              automation_template[`cta_${index + 1}_final_response`];
            campaignCtaData[`cta_${index + 1}_option_type`] =
              automation_template[`cta_${index + 1}_option_type`];
          }
          await campaignCtaCtl.create(campaignCtaData);
        }
        await sendWhatsAppMessage(
          submission.contact.contact_id,
          rule.automation_rule_id,
          campaign_name,
          tracker_ref_name,
          'now',
          encryptionKeys,
        );
      }
    }
  };
  async function messageContactHaventTakenAClass(rule, encryptionKeys) {
    console.log('💥💥💥💥💥💥💥START AUTOMATION LOG💥💥💥💥💥💥💥');
    console.log(
      '💥💥💥💥💥💥💥 Message contact that havent taken a class 💥💥💥💥💥💥💥',
    );

    const contacts = [];
    const agencyId = rule?.automation_category?.agency_fk;

    const execDate =
      getExecutionTime(rule) !== -1
        ? getExecutionTime(rule).format('YYYY-MM-DD')
        : moment().format('YYYY-MM-DD');

    if (h.notEmpty(rule?.automation_rule_packages)) {
      for (const pckg of rule?.automation_rule_packages) {
        if (pckg.dataValues.mindbody_package) {
          const services = await mindBodyClientServicesCtlr.findAll(
            {
              [Op.and]: [
                {
                  payload: {
                    [rule?.exclude_package === '0'
                      ? Op.like
                      : Op.notLike]: `%"ProductId":${pckg.dataValues.mindbody_package.package_id}%`,
                  },
                },
                {
                  payload: {
                    [Op.like]: `%"ActiveDate":"${execDate}T00:00:00"%`,
                  },
                },
              ],
            },
            {
              include: [
                {
                  model: models.contact,
                  required: true,
                  where: {
                    agency_fk: agencyId,
                    [Op.or]: [
                      {
                        whatsapp_engagement: 'all',
                      },
                      {
                        whatsapp_engagement: {
                          [Op.like]: `%automation%`,
                        },
                      },
                    ],
                  },
                  include: {
                    model: models.agency_user,
                    required: true,
                  },
                },
              ],
            },
          );

          for (const member of services) {
            const contactIds = contacts.map((m) => m.contactId);
            if (!contactIds.includes(member.contact_fk)) {
              const wVisit = await mindBodyClientVisitCtlr.findAll(
                {
                  [Op.and]: [
                    {
                      payload: {
                        [rule?.exclude_package === '0'
                          ? Op.like
                          : Op.notLike]: `%"ProductId":${pckg.dataValues.mindbody_package.package_id}%`,
                      },
                    },
                  ],
                },
                {
                  include: [
                    {
                      model: models.contact,
                      required: true,
                      where: {
                        contact_id: member.contact_fk,
                      },
                    },
                  ],
                },
              );

              if (
                wVisit.every((e) => {
                  return e.payload.includes(`"Missed":"false"`);
                })
              ) {
                contacts.push({
                  contactId: member.contact_fk,
                  executionDateTime: execDate,
                });
              }
            }
          }
        }
      }
    }

    if (h.notEmpty(contacts)) {
      const agency = agencyCtr.findOne({ agency_id: agencyId });
      const agencyRecord = agency.dataValues;
      const campaign_name = `Automated Message ${agencyId} ${Date.now()}`;
      const tracker_ref_name = `${agencyId}_${Date.now()}_automation_${
        agencyRecord?.agency_name.replaceAll(' ', '_').toLowerCase() || 'agency'
      }`;

      const { agency_config_id, whatsapp_config } =
        await models.agency_config.findOne({
          where: { agency_fk: agencyId },
        });
      const wa_config = JSON.parse(whatsapp_config);
      console.log(wa_config);
      let saved_quick_replies = !h.isEmpty(wa_config.quick_replies)
        ? wa_config.quick_replies
        : [];
      const new_whatsapp_config = {
        is_enabled: wa_config.is_enabled,
        environment: wa_config.environment,
        quick_replies: saved_quick_replies,
      };

      // setup messaging config
      const cta = [];
      const automation_template = await automationRuleTemplateCtr.findOne({
        automation_rule_fk: rule.automation_rule_id,
      });

      const waba_template = await wabaTemplateCtr.findOne({
        waba_template_id: automation_template.template_fk,
      });

      // console.log(waba_template);
      const template = waba_template.dataValues;
      const selected_template = JSON.parse(template.content);
      const cta_option_type = [];
      for (let index = 0; index < 10; index++) {
        cta_option_type.push(
          automation_template[`cta_${index + 1}_option_type`],
        );
      }
      selected_template.components.forEach((component) => {
        if (h.cmpStr(component.type, 'BUTTONS')) {
          let qr_index = 0;
          component.buttons.forEach((btn, index) => {
            if (h.cmpStr(btn.type, 'QUICK_REPLY')) {
              cta.push(btn.text);
              saved_quick_replies = h.whatsapp.checkIfQRIsCheckedAnMonitored(
                cta_option_type[qr_index],
                btn.text,
                saved_quick_replies,
              );
              qr_index++;
            }
          });
        }
      });

      if (!h.isEmpty(cta)) {
        console.log(cta);
        new_whatsapp_config.quick_replies = saved_quick_replies;
        await agencyConfigCtl.update(agency_config_id, {
          whatsapp_config: JSON.stringify(new_whatsapp_config),
        });
        const campaignCtaData = {
          campaign_tracker_ref_name: tracker_ref_name,
          campaign_notification_additional_recipients: null,
          is_confirmation: false,
        };
        for (let index = 0; index < 10; index++) {
          campaignCtaData[`cta_${index + 1}`] = !h.isEmpty(cta[index])
            ? cta[index]
            : null;
          campaignCtaData[`cta_${index + 1}_response`] =
            automation_template[`cta_${index + 1}_response`];
          campaignCtaData[`trigger_cta_${index + 1}_options`] =
            automation_template[`trigger_cta_${index + 1}_options`];
          campaignCtaData[`cta_${index + 1}_final_response`] =
            automation_template[`cta_${index + 1}_final_response`];
          campaignCtaData[`cta_${index + 1}_option_type`] =
            automation_template[`cta_${index + 1}_option_type`];
        }
        await campaignCtaCtl.create(campaignCtaData);
      }
      for (const contact of contacts) {
        console.log({
          contact_id: contact.contactId,
          rule_id: rule.automation_rule_id,
          executionDateTime: contact.executionDateTime,
        });

        await sendWhatsAppMessage(
          contact.contactId,
          rule.automation_rule_id,
          campaign_name,
          tracker_ref_name,
          contact.executionDateTime,
          encryptionKeys,
        );
      }
    }

    console.log('💥💥💥💥💥💥💥 END LOG💥💥💥💥💥💥💥');
  }

  async function messageContactBeforeExpiration(rule, encryptionKeys) {
    console.log('💥💥💥💥💥💥💥START AUTOMATION LOG💥💥💥💥💥💥💥');
    console.log(
      '💥💥💥💥💥💥💥 Message contact before expiration day 💥💥💥💥💥💥💥',
    );

    const contacts = [];
    const agencyId = rule?.automation_category?.agency_fk;

    const execTime =
      getExecutionBeforeDate(rule) !== -1
        ? getExecutionBeforeDate(rule).format('YYYY-MM-DD')
        : moment().format('YYYY-MM-DD');

    if (h.notEmpty(rule?.automation_rule_packages)) {
      for (const pckg of rule?.automation_rule_packages) {
        if (pckg.dataValues.mindbody_package) {
          const membership = await mindBodyClientContractCtlr.findAll(
            {
              [Op.and]: [
                {
                  payload: {
                    [rule?.exclude_package === '0'
                      ? Op.like
                      : Op.notLike]: `%"ContractID":${pckg.dataValues.mindbody_package.package_id}%`,
                  },
                },
                {
                  payload: {
                    [Op.like]: `%"EndDate":"${execTime}T00:00:00"%`,
                  },
                },
              ],
            },
            {
              include: [
                {
                  model: models.contact,
                  required: true,
                  where: {
                    agency_fk: agencyId,
                    [Op.or]: [
                      {
                        whatsapp_engagement: 'all',
                      },
                      {
                        whatsapp_engagement: {
                          [Op.like]: `%automation%`,
                        },
                      },
                    ],
                  },
                  include: {
                    model: models.agency_user,
                    required: true,
                  },
                },
              ],
            },
          );

          const services = await mindBodyClientServicesCtlr.findAll(
            {
              [Op.and]: [
                {
                  payload: {
                    [rule?.exclude_package === '0'
                      ? Op.like
                      : Op.notLike]: `%"ProductId":${pckg.dataValues.mindbody_package.package_id}%`,
                  },
                },
                {
                  payload: {
                    [Op.like]: `%"ExpirationDate":"${execTime}T00:00:00"%`,
                  },
                },
              ],
            },
            {
              include: [
                {
                  model: models.contact,
                  required: true,
                  where: {
                    agency_fk: agencyId,
                    [Op.or]: [
                      {
                        whatsapp_engagement: 'all',
                      },
                      {
                        whatsapp_engagement: {
                          [Op.like]: `%automation%`,
                        },
                      },
                    ],
                  },
                  include: {
                    model: models.agency_user,
                    required: true,
                  },
                },
              ],
            },
          );

          for (const member of membership) {
            console.log(member.payload);
            const contactIds = contacts.map((m) => m.contactId);
            if (!contactIds.includes(member.contact_fk)) {
              contacts.push({
                contactId: member.contact_fk,
                executionDateTime: execTime,
              });
            }
          }

          for (const service of services) {
            console.log(service.payload);
            const contactIds = contacts.map((m) => m.contactId);
            if (!contactIds.includes(service.contact_fk)) {
              contacts.push({
                contactId: service.contact_fk,
                executionDateTime: execTime,
              });
            }
          }
        }
      }
    } else {
      const mbContacts = await mindBodyClientContractCtlr.findAll({
        [Op.and]: [
          {
            payload: {
              [Op.like]: `%"EndDate":"${execTime}T00:00:00"%`,
            },
          },
        ],
      });

      for (const contact of mbContacts) {
        if (!contacts.includes(contact.contact_fk)) {
          if (
            h.notEmpty(contact.agency_user_fk) &&
            canEngage(contact, 'automation')
          ) {
            contacts.push({
              contactId: contact.contact_fk,
              executionDateTime: execTime,
            });
          }
        }
      }
    }

    if (h.notEmpty(contacts)) {
      const agency = agencyCtr.findOne({ agency_id: agencyId });
      const agencyRecord = agency.dataValues;
      const campaign_name = `Automated Message ${agencyId} ${Date.now()}`;
      const tracker_ref_name = `${agencyId}_${Date.now()}_automation_${
        agencyRecord?.agency_name.replaceAll(' ', '_').toLowerCase() || 'agency'
      }`;

      const { agency_config_id, whatsapp_config } =
        await models.agency_config.findOne({
          where: { agency_fk: agencyId },
        });
      const wa_config = JSON.parse(whatsapp_config);
      console.log(wa_config);
      let saved_quick_replies = !h.isEmpty(wa_config.quick_replies)
        ? wa_config.quick_replies
        : [];
      const new_whatsapp_config = {
        is_enabled: wa_config.is_enabled,
        environment: wa_config.environment,
        quick_replies: saved_quick_replies,
      };

      // setup messaging config
      const cta = [];
      const automation_template = await automationRuleTemplateCtr.findOne({
        automation_rule_fk: rule.automation_rule_id,
      });

      const waba_template = await wabaTemplateCtr.findOne({
        waba_template_id: automation_template.template_fk,
      });

      // console.log(waba_template);
      const template = waba_template.dataValues;
      const selected_template = JSON.parse(template.content);
      const cta_option_type = [];
      for (let index = 0; index < 10; index++) {
        cta_option_type.push(
          automation_template[`cta_${index + 1}_option_type`],
        );
      }
      selected_template.components.forEach((component) => {
        if (h.cmpStr(component.type, 'BUTTONS')) {
          let qr_index = 0;
          component.buttons.forEach((btn, index) => {
            if (h.cmpStr(btn.type, 'QUICK_REPLY')) {
              cta.push(btn.text);
              saved_quick_replies = h.whatsapp.checkIfQRIsCheckedAnMonitored(
                cta_option_type[qr_index],
                btn.text,
                saved_quick_replies,
              );
              qr_index++;
            }
          });
        }
      });

      if (!h.isEmpty(cta)) {
        console.log(cta);
        new_whatsapp_config.quick_replies = saved_quick_replies;
        await agencyConfigCtl.update(agency_config_id, {
          whatsapp_config: JSON.stringify(new_whatsapp_config),
        });
        const campaignCtaData = {
          campaign_tracker_ref_name: tracker_ref_name,
          campaign_notification_additional_recipients: null,
          is_confirmation: false,
        };
        for (let index = 0; index < 10; index++) {
          campaignCtaData[`cta_${index + 1}`] = !h.isEmpty(cta[index])
            ? cta[index]
            : null;
          campaignCtaData[`cta_${index + 1}_response`] =
            automation_template[`cta_${index + 1}_response`];
          campaignCtaData[`trigger_cta_${index + 1}_options`] =
            automation_template[`trigger_cta_${index + 1}_options`];
          campaignCtaData[`cta_${index + 1}_final_response`] =
            automation_template[`cta_${index + 1}_final_response`];
          campaignCtaData[`cta_${index + 1}_option_type`] =
            automation_template[`cta_${index + 1}_option_type`];
        }
        await campaignCtaCtl.create(campaignCtaData);
      }
      for (const contact of contacts) {
        console.log({
          contact_id: contact.contactId,
          rule_id: rule.automation_rule_id,
          executionDateTime: contact.executionDateTime,
        });

        await sendWhatsAppMessage(
          contact.contactId,
          rule.automation_rule_id,
          campaign_name,
          tracker_ref_name,
          contact.executionDateTime,
          encryptionKeys,
        );
      }
    }

    console.log('💥💥💥💥💥💥💥 END LOG💥💥💥💥💥💥💥');
  }

  async function messageContactAfterExpiration(rule, encryptionKeys) {
    console.log('💥💥💥💥💥💥💥START AUTOMATION LOG💥💥💥💥💥💥💥');
    console.log(
      '💥💥💥💥💥💥💥 Message contact after expiration day 💥💥💥💥💥💥💥',
    );

    const contacts = [];
    const agencyId = rule?.automation_category?.agency_fk;

    const execTime =
      getExecutionTime(rule) !== -1
        ? getExecutionTime(rule).format('YYYY-MM-DD')
        : moment().format('YYYY-MM-DD');

    if (h.notEmpty(rule?.automation_rule_packages)) {
      for (const pckg of rule?.automation_rule_packages) {
        if (pckg.dataValues.mindbody_package) {
          const membership = await mindBodyClientContractCtlr.findAll(
            {
              [Op.and]: [
                {
                  payload: {
                    [rule?.exclude_package === '0'
                      ? Op.like
                      : Op.notLike]: `%"ContractID":${pckg.dataValues.mindbody_package.package_id}%`,
                  },
                },
                {
                  payload: {
                    [Op.like]: `%"EndDate":"${execTime}T00:00:00"%`,
                  },
                },
              ],
            },
            {
              include: [
                {
                  model: models.contact,
                  where: {
                    agency_fk: agencyId,
                    [Op.or]: [
                      {
                        whatsapp_engagement: 'all',
                      },
                      {
                        whatsapp_engagement: {
                          [Op.like]: `%automation%`,
                        },
                      },
                    ],
                  },
                  include: {
                    model: models.agency_user,
                    required: true,
                  },
                },
              ],
            },
          );

          const services = await mindBodyClientServicesCtlr.findAll(
            {
              [Op.and]: [
                {
                  payload: {
                    [rule?.exclude_package === '0'
                      ? Op.like
                      : Op.notLike]: `%"ProductId":${pckg.dataValues.mindbody_package.package_id}%`,
                  },
                },
                {
                  payload: {
                    [Op.like]: `%"ExpirationDate":"${execTime}T00:00:00"%`,
                  },
                },
              ],
            },
            {
              include: [
                {
                  model: models.contact,
                  where: {
                    agency_fk: agencyId,
                    [Op.or]: [
                      {
                        whatsapp_engagement: 'all',
                      },
                      {
                        whatsapp_engagement: {
                          [Op.like]: `%automation%`,
                        },
                      },
                    ],
                  },
                  include: {
                    model: models.agency_user,
                    required: true,
                  },
                },
              ],
            },
          );

          for (const member of membership) {
            console.log(member.payload);
            const contactIds = contacts.map((m) => m.contactId);
            if (!contactIds.includes(member.contact_fk)) {
              contacts.push({
                contactId: member.contact_fk,
                executionDateTime: execTime,
              });
            }
          }

          for (const service of services) {
            console.log(service.payload);
            const contactIds = contacts.map((m) => m.contactId);
            if (!contactIds.includes(service.contact_fk)) {
              contacts.push({
                contactId: service.contact_fk,
                executionDateTime: execTime,
              });
            }
          }
        }
      }
    } else {
      const mbContacts = await mindBodyClientContractCtlr.findAll({
        [Op.and]: [
          {
            payload: {
              [Op.like]: `%"EndDate":"${execTime}T00:00:00"%`,
            },
          },
        ],
      });

      for (const contact of mbContacts) {
        if (!contacts.includes(contact.contact_fk)) {
          if (
            h.notEmpty(contact.agency_user_fk) &&
            canEngage(contact, 'automation')
          ) {
            contacts.push({
              contactId: contact.contact_fk,
              executionDateTime: execTime,
            });
          }
        }
      }
    }

    if (h.notEmpty(contacts)) {
      const agency = agencyCtr.findOne({ agency_id: agencyId });
      const agencyRecord = agency.dataValues;
      const campaign_name = `Automated Message ${agencyId} ${Date.now()}`;
      const tracker_ref_name = `${agencyId}_${Date.now()}_automation_${
        agencyRecord?.agency_name.replaceAll(' ', '_').toLowerCase() || 'agency'
      }`;

      const { agency_config_id, whatsapp_config } =
        await models.agency_config.findOne({
          where: { agency_fk: agencyId },
        });
      const wa_config = JSON.parse(whatsapp_config);
      console.log(wa_config);
      let saved_quick_replies = !h.isEmpty(wa_config.quick_replies)
        ? wa_config.quick_replies
        : [];
      const new_whatsapp_config = {
        is_enabled: wa_config.is_enabled,
        environment: wa_config.environment,
        quick_replies: saved_quick_replies,
      };

      // setup messaging config
      const cta = [];
      const automation_template = await automationRuleTemplateCtr.findOne({
        automation_rule_fk: rule.automation_rule_id,
      });

      const waba_template = await wabaTemplateCtr.findOne({
        waba_template_id: automation_template.template_fk,
      });

      // console.log(waba_template);
      const template = waba_template.dataValues;
      const selected_template = JSON.parse(template.content);
      const cta_option_type = [];
      for (let index = 0; index < 10; index++) {
        cta_option_type.push(
          automation_template[`cta_${index + 1}_option_type`],
        );
      }
      selected_template.components.forEach((component) => {
        if (h.cmpStr(component.type, 'BUTTONS')) {
          let qr_index = 0;
          component.buttons.forEach((btn, index) => {
            if (h.cmpStr(btn.type, 'QUICK_REPLY')) {
              cta.push(btn.text);
              saved_quick_replies = h.whatsapp.checkIfQRIsCheckedAnMonitored(
                cta_option_type[qr_index],
                btn.text,
                saved_quick_replies,
              );
              qr_index++;
            }
          });
        }
      });

      if (!h.isEmpty(cta)) {
        console.log(cta);
        new_whatsapp_config.quick_replies = saved_quick_replies;
        await agencyConfigCtl.update(agency_config_id, {
          whatsapp_config: JSON.stringify(new_whatsapp_config),
        });
        const campaignCtaData = {
          campaign_tracker_ref_name: tracker_ref_name,
          campaign_notification_additional_recipients: null,
          is_confirmation: false,
        };
        for (let index = 0; index < 10; index++) {
          campaignCtaData[`cta_${index + 1}`] = !h.isEmpty(cta[index])
            ? cta[index]
            : null;
          campaignCtaData[`cta_${index + 1}_response`] =
            automation_template[`cta_${index + 1}_response`];
          campaignCtaData[`trigger_cta_${index + 1}_options`] =
            automation_template[`trigger_cta_${index + 1}_options`];
          campaignCtaData[`cta_${index + 1}_final_response`] =
            automation_template[`cta_${index + 1}_final_response`];
          campaignCtaData[`cta_${index + 1}_option_type`] =
            automation_template[`cta_${index + 1}_option_type`];
        }
        await campaignCtaCtl.create(campaignCtaData);
      }
      for (const contact of contacts) {
        console.log({
          contact_id: contact.contactId,
          rule_id: rule.automation_rule_id,
          executionDateTime: contact.executionDateTime,
        });

        await sendWhatsAppMessage(
          contact.contactId,
          rule.automation_rule_id,
          campaign_name,
          tracker_ref_name,
          contact.executionDateTime,
          encryptionKeys,
        );
      }
    }

    console.log('💥💥💥💥💥💥💥 END LOG💥💥💥💥💥💥💥');
  }
  async function messageContactAfterPurchase(rule, encryptionKeys) {
    console.log('💥💥💥💥💥💥💥START AUTOMATION LOG💥💥💥💥💥💥💥');
    console.log('💥💥💥💥💥💥💥 Messafe contact after purchase 💥💥💥💥💥💥💥');

    const contacts = [];
    const agencyId = rule?.automation_category?.agency_fk;

    const execTime =
      getExecutionTime(rule) !== -1
        ? getExecutionTime(rule)
            .subtract(5, 'minutes')
            .format('YYYY-MM-DD H:m:s')
        : moment().subtract(5, 'minutes').format('YYYY-MM-DD H:m:s');
    const nowTime =
      getExecutionTime(rule) !== -1
        ? moment(execTime).add(5, 'minutes').format('YYYY-MM-DD H:m:s')
        : moment().format('YYYY-MM-DD H:m:s');

    if (h.notEmpty(rule?.automation_rule_packages)) {
      for (const pckg of rule?.automation_rule_packages) {
        if (pckg.dataValues.mindbody_package) {
          const membership = await mindBodyClientContractCtlr.findAll(
            {
              [Op.and]: [
                {
                  payload: {
                    [rule?.exclude_package === '0'
                      ? Op.like
                      : Op.notLike]: `%"ContractID":${pckg.dataValues.mindbody_package.package_id}%`,
                  },
                },
                {
                  payload: {
                    [Op.like]: `%"StartDate":"${moment().format(
                      'YYYY-MM-DD',
                    )}T00:00:00"%`,
                  },
                },
                {
                  created_date: {
                    [Op.between]: [new Date(execTime), new Date(nowTime)],
                  },
                },
              ],
            },
            {
              include: [
                {
                  model: models.contact,
                  where: {
                    agency_fk: agencyId,
                    [Op.or]: [
                      {
                        whatsapp_engagement: 'all',
                      },
                      {
                        whatsapp_engagement: {
                          [Op.like]: `%automation%`,
                        },
                      },
                    ],
                  },
                  include: {
                    model: models.agency_user,
                    required: true,
                  },
                },
              ],
            },
          );

          const services = await mindBodyClientServicesCtlr.findAll(
            {
              [Op.and]: [
                {
                  payload: {
                    [rule?.exclude_package === '0'
                      ? Op.like
                      : Op.notLike]: `%"ProductId":${pckg.dataValues.mindbody_package.package_id}%`,
                  },
                },
                {
                  payload: {
                    [Op.like]: `%"ActiveDate":"${moment().format(
                      'YYYY-MM-DD',
                    )}T00:00:00"%`,
                  },
                },
                {
                  created_date: {
                    [Op.between]: [new Date(execTime), new Date(nowTime)],
                  },
                },
              ],
            },
            {
              include: [
                {
                  model: models.contact,
                  where: {
                    agency_fk: agencyId,
                    [Op.or]: [
                      {
                        whatsapp_engagement: 'all',
                      },
                      {
                        whatsapp_engagement: {
                          [Op.like]: `%automation%`,
                        },
                      },
                    ],
                  },
                  include: {
                    model: models.agency_user,
                    required: true,
                  },
                },
              ],
            },
          );

          for (const member of membership) {
            const contactIds = contacts.map((m) => m.contactId);
            if (!contactIds.includes(member.contact_fk)) {
              contacts.push({
                contactId: member.contact_fk,
                executionDateTime: execTime,
              });
            }
          }

          for (const service of services) {
            const contactIds = contacts.map((m) => m.contactId);
            if (!contactIds.includes(service.contact_fk)) {
              contacts.push({
                contactId: service.contact_fk,
                executionDateTime: execTime,
              });
            }
          }
        }
      }
    } else {
      const mbContacts = await mindBodyClientContractCtlr.findAll({
        [Op.and]: [
          {
            payload: {
              [Op.like]: `%"StartDate":"${moment().format(
                'YYYY-MM-DD',
              )}T00:00:00"%`,
            },
          },
          {
            created_date: {
              [Op.between]: [new Date(execTime), new Date(nowTime)],
            },
          },
        ],
      });

      const mbServices = await mindBodyClientServicesCtlr.findAll({
        [Op.and]: [
          {
            payload: {
              [Op.like]: `%"ActiveDate":"${moment().format(
                'YYYY-MM-DD',
              )}T00:00:00"%`,
            },
          },
          {
            created_date: {
              [Op.between]: [new Date(execTime), new Date(nowTime)],
            },
          },
        ],
      });

      for (const contact of mbContacts) {
        if (!contacts.includes(contact.contact_fk)) {
          if (
            h.notEmpty(contact.agency_user_fk) &&
            canEngage(contact, 'automation')
          ) {
            contacts.push({
              contactId: contact.contact_fk,
              executionDateTime: execTime,
            });
          }
        }
      }

      for (const contact of mbServices) {
        if (!contacts.includes(contact.contact_fk)) {
          if (
            h.notEmpty(contact.agency_user_fk) &&
            canEngage(contact, 'automation')
          ) {
            contacts.push({
              contactId: contact.contact_fk,
              executionDateTime: execTime,
            });
          }
        }
      }
    }

    if (h.notEmpty(contacts)) {
      const agency = agencyCtr.findOne({ agency_id: agencyId });
      const agencyRecord = agency.dataValues;
      const campaign_name = `Automated Message ${agencyId} ${Date.now()}`;
      const tracker_ref_name = `${agencyId}_${Date.now()}_automation_${
        agencyRecord?.agency_name.replaceAll(' ', '_').toLowerCase() || 'agency'
      }`;

      const { agency_config_id, whatsapp_config } =
        await models.agency_config.findOne({
          where: { agency_fk: agencyId },
        });
      const wa_config = JSON.parse(whatsapp_config);
      console.log(wa_config);
      let saved_quick_replies = !h.isEmpty(wa_config.quick_replies)
        ? wa_config.quick_replies
        : [];
      const new_whatsapp_config = {
        is_enabled: wa_config.is_enabled,
        environment: wa_config.environment,
        quick_replies: saved_quick_replies,
      };

      // setup messaging config
      const cta = [];
      const automation_template = await automationRuleTemplateCtr.findOne({
        automation_rule_fk: rule.automation_rule_id,
      });

      const waba_template = await wabaTemplateCtr.findOne({
        waba_template_id: automation_template.template_fk,
      });

      // console.log(waba_template);
      const template = waba_template.dataValues;
      const selected_template = JSON.parse(template.content);
      const cta_option_type = [];
      for (let index = 0; index < 10; index++) {
        cta_option_type.push(
          automation_template[`cta_${index + 1}_option_type`],
        );
      }
      selected_template.components.forEach((component) => {
        if (h.cmpStr(component.type, 'BUTTONS')) {
          let qr_index = 0;
          component.buttons.forEach((btn, index) => {
            if (h.cmpStr(btn.type, 'QUICK_REPLY')) {
              cta.push(btn.text);
              saved_quick_replies = h.whatsapp.checkIfQRIsCheckedAnMonitored(
                cta_option_type[qr_index],
                btn.text,
                saved_quick_replies,
              );
              qr_index++;
            }
          });
        }
      });

      if (!h.isEmpty(cta)) {
        console.log(cta);
        new_whatsapp_config.quick_replies = saved_quick_replies;
        await agencyConfigCtl.update(agency_config_id, {
          whatsapp_config: JSON.stringify(new_whatsapp_config),
        });
        const campaignCtaData = {
          campaign_tracker_ref_name: tracker_ref_name,
          campaign_notification_additional_recipients: null,
          is_confirmation: false,
        };
        for (let index = 0; index < 10; index++) {
          campaignCtaData[`cta_${index + 1}`] = !h.isEmpty(cta[index])
            ? cta[index]
            : null;
          campaignCtaData[`cta_${index + 1}_response`] =
            automation_template[`cta_${index + 1}_response`];
          campaignCtaData[`trigger_cta_${index + 1}_options`] =
            automation_template[`trigger_cta_${index + 1}_options`];
          campaignCtaData[`cta_${index + 1}_final_response`] =
            automation_template[`cta_${index + 1}_final_response`];
          campaignCtaData[`cta_${index + 1}_option_type`] =
            automation_template[`cta_${index + 1}_option_type`];
        }
        await campaignCtaCtl.create(campaignCtaData);
      }
      for (const contact of contacts) {
        console.log({
          contact_id: contact.contactId,
          rule_id: rule.automation_rule_id,
          executionDateTime: contact.executionDateTime,
        });

        await sendWhatsAppMessage(
          contact.contactId,
          rule.automation_rule_id,
          campaign_name,
          tracker_ref_name,
          contact.executionDateTime,
          encryptionKeys,
        );
      }
    }

    console.log('💥💥💥💥💥💥💥 END LOG💥💥💥💥💥💥💥');
  }

  async function messageContactAfterFormSubmissions(rule, encryptionKeys) {
    console.log('💥💥💥💥💥💥💥START AUTOMATION LOG💥💥💥💥💥💥💥');
    console.log(
      '💥💥💥💥💥💥💥 Message contact after form submission 💥💥💥💥💥💥💥',
    );

    if (rule.rule_trigger_setting === 'immediately') {
      console.log('💥💥💥💥💥💥💥 SKIP immediately rule💥💥💥💥💥💥💥');
      return;
    }

    const contacts = [];
    const execTime =
      getExecutionTime(rule) !== -1
        ? getExecutionTime(rule)
            .subtract(5, 'minutes')
            .format('YYYY-MM-DD H:m:s')
        : moment().subtract(5, 'minutes').format('YYYY-MM-DD H:m:s');
    const nowTime =
      getExecutionTime(rule) !== -1
        ? moment(execTime).add(5, 'minutes').format('YYYY-MM-DD H:m:s')
        : moment().format('YYYY-MM-DD H:m:s');

    if (h.notEmpty(rule?.automation_rule_form)) {
      const submissions = await hubSpotFormSubmissionsCtlr.findAll(
        {
          hubspot_form_fk: rule?.automation_rule_form.dataValues.form_fk,
          created_date: {
            [Op.between]: [new Date(execTime), new Date(nowTime)],
          },
          status: 'create',
        },
        {
          include: [
            {
              model: models.contact,
              required: true,
            },
          ],
        },
      );

      for (const sub of submissions) {
        if (!contacts.includes(sub.contact_fk)) {
          if (
            h.notEmpty(sub.contact.agency_user_fk) &&
            canEngage(sub.contact, 'automation')
          ) {
            contacts.push({
              contactId: sub.contact_fk,
              executionDateTime: execTime,
            });
          }
        }
      }

      if (h.notEmpty(contacts)) {
        const agencyId = submissions.contact.agency_fk;
        const agency = agencyCtr.findOne({ agency_id: agencyId });
        const agencyRecord = agency.dataValues;
        const campaign_name = `Automated Message ${agencyId} ${Date.now()}`;
        const tracker_ref_name = `${agencyId}_${Date.now()}_automation_${
          agencyRecord?.agency_name.replaceAll(' ', '_').toLowerCase() ||
          'agency'
        }`;

        const { agency_config_id, whatsapp_config } =
          await models.agency_config.findOne({
            where: { agency_fk: agencyId },
          });
        const wa_config = JSON.parse(whatsapp_config);
        console.log(wa_config);
        let saved_quick_replies = !h.isEmpty(wa_config.quick_replies)
          ? wa_config.quick_replies
          : [];
        const new_whatsapp_config = {
          is_enabled: wa_config.is_enabled,
          environment: wa_config.environment,
          quick_replies: saved_quick_replies,
        };

        // setup messaging config
        const cta = [];
        const automation_template = await automationRuleTemplateCtr.findOne({
          automation_rule_fk: rule.automation_rule_id,
        });

        const waba_template = await wabaTemplateCtr.findOne({
          waba_template_id: automation_template.template_fk,
        });

        // console.log(waba_template);
        const template = waba_template.dataValues;
        const selected_template = JSON.parse(template.content);
        const cta_option_type = [];
        for (let index = 0; index < 10; index++) {
          cta_option_type.push(
            automation_template[`cta_${index + 1}_option_type`],
          );
        }
        selected_template.components.forEach((component) => {
          if (h.cmpStr(component.type, 'BUTTONS')) {
            let qr_index = 0;
            component.buttons.forEach((btn, index) => {
              if (h.cmpStr(btn.type, 'QUICK_REPLY')) {
                cta.push(btn.text);
                saved_quick_replies = h.whatsapp.checkIfQRIsCheckedAnMonitored(
                  cta_option_type[qr_index],
                  btn.text,
                  saved_quick_replies,
                );
                qr_index++;
              }
            });
          }
        });

        if (!h.isEmpty(cta)) {
          console.log(cta);
          new_whatsapp_config.quick_replies = saved_quick_replies;
          await agencyConfigCtl.update(agency_config_id, {
            whatsapp_config: JSON.stringify(new_whatsapp_config),
          });
          const campaignCtaData = {
            campaign_tracker_ref_name: tracker_ref_name,
            campaign_notification_additional_recipients: null,
            is_confirmation: false,
          };
          for (let index = 0; index < 10; index++) {
            campaignCtaData[`cta_${index + 1}`] = !h.isEmpty(cta[index])
              ? cta[index]
              : null;
            campaignCtaData[`cta_${index + 1}_response`] =
              automation_template[`cta_${index + 1}_response`];
            campaignCtaData[`trigger_cta_${index + 1}_options`] =
              automation_template[`trigger_cta_${index + 1}_options`];
            campaignCtaData[`cta_${index + 1}_final_response`] =
              automation_template[`cta_${index + 1}_final_response`];
            campaignCtaData[`cta_${index + 1}_option_type`] =
              automation_template[`cta_${index + 1}_option_type`];
          }
          await campaignCtaCtl.create(campaignCtaData);
        }
        for (const contact of contacts) {
          console.log({
            contact_id: contact.contactId,
            rule_id: rule.automation_rule_id,
            executionDateTime: contact.executionDateTime,
          });

          const agencyId = contact.agency_fk;
          const agency = agencyCtr.findOne({ agency_id: agencyId });
          const agencyRecord = agency.dataValues;
          const campaign_name = `Automated Message ${agencyId} ${Date.now()}`;
          const tracker_ref_name = `${agencyId}_${Date.now()}_automation_${
            agencyRecord?.agency_name.replaceAll(' ', '_').toLowerCase() ||
            'agency'
          }`;

          await sendWhatsAppMessage(
            contact.contactId,
            rule.automation_rule_id,
            campaign_name,
            tracker_ref_name,
            contact.executionDateTime,
            encryptionKeys,
          );
        }
      }
    }
  }

  async function messageContactAfterFirstPurchase(rule, encryptionKeys) {
    console.log('💥💥💥💥💥💥💥START AUTOMATION LOG💥💥💥💥💥💥💥');
    console.log(
      '💥💥💥💥💥💥💥 Message contact after first booking 💥💥💥💥💥💥💥',
    );

    const contacts = [];
    const agencyId = rule?.automation_category?.agency_fk;

    const execTime =
      getExecutionTime(rule) !== -1
        ? getExecutionTime(rule)
            .subtract(5, 'minutes')
            .format('YYYY-MM-DD H:m:s')
        : moment().subtract(5, 'minutes').format('YYYY-MM-DD H:m:s');
    const nowTime =
      getExecutionTime(rule) !== -1
        ? moment(execTime).add(5, 'minutes').format('YYYY-MM-DD H:m:s')
        : moment().format('YYYY-MM-DD H:m:s');

    if (h.notEmpty(rule?.automation_rule_packages)) {
      for (const pckg of rule?.automation_rule_packages) {
        if (pckg.dataValues.mindbody_package) {
          const services = await mindBodyClientServicesCtlr.findAll(
            {
              [Op.and]: [
                {
                  payload: {
                    [rule?.exclude_package === '0'
                      ? Op.like
                      : Op.notLike]: `%"ProductId":${pckg.dataValues.mindbody_package.package_id}%`,
                  },
                },
                {
                  payload: {
                    [Op.like]: `%"ActiveDate":"${moment().format(
                      'YYYY-MM-DD',
                    )}T00:00:00"%`,
                  },
                },
                {
                  created_date: {
                    [Op.between]: [new Date(execTime), new Date(nowTime)],
                  },
                },
              ],
            },
            {
              include: [
                {
                  model: models.contact,
                  where: {
                    agency_fk: agencyId,
                    [Op.or]: [
                      {
                        whatsapp_engagement: 'all',
                      },
                      {
                        whatsapp_engagement: {
                          [Op.like]: `%automation%`,
                        },
                      },
                    ],
                  },
                  include: {
                    model: models.agency_user,
                    required: true,
                  },
                },
              ],
            },
          );

          for (const service of services) {
            const contactIds = contacts.map((m) => m.contactId);
            if (!contactIds.includes(service.contact_fk)) {
              contacts.push({
                contactId: service.contact_fk,
                executionDateTime: execTime,
              });
            }
          }
        }
      }
    } else {
      const mbContacts = await mindBodyClientContractCtlr.findAll({
        [Op.and]: [
          {
            payload: {
              [Op.like]: `%"StartDate":"${moment().format(
                'YYYY-MM-DD',
              )}T00:00:00"%`,
            },
          },
          {
            created_date: {
              [Op.between]: [new Date(execTime), new Date(nowTime)],
            },
          },
        ],
      });

      const mbServices = await mindBodyClientServicesCtlr.findAll({
        [Op.and]: [
          {
            payload: {
              [Op.like]: `%"ActiveDate":"${moment().format(
                'YYYY-MM-DD',
              )}T00:00:00"%`,
            },
          },
          {
            created_date: {
              [Op.between]: [new Date(execTime), new Date(nowTime)],
            },
          },
        ],
      });

      for (const contact of mbContacts) {
        if (!contacts.includes(contact.contact_fk)) {
          if (
            h.notEmpty(contact.agency_user_fk) &&
            canEngage(contact, 'automation')
          ) {
            contacts.push({
              contactId: contact.contact_fk,
              executionDateTime: execTime,
            });
          }
        }
      }

      for (const contact of mbServices) {
        if (!contacts.includes(contact.contact_fk)) {
          if (
            h.notEmpty(contact.agency_user_fk) &&
            canEngage(contact, 'automation')
          ) {
            contacts.push({
              contactId: contact.contact_fk,
              executionDateTime: execTime,
            });
          }
        }
      }
    }

    if (h.notEmpty(contacts)) {
      const agency = agencyCtr.findOne({ agency_id: agencyId });
      const agencyRecord = agency.dataValues;
      const campaign_name = `Automated Message ${agencyId} ${Date.now()}`;
      const tracker_ref_name = `${agencyId}_${Date.now()}_automation_${
        agencyRecord?.agency_name.replaceAll(' ', '_').toLowerCase() || 'agency'
      }`;
      for (const contact of contacts) {
        console.log({
          contact_id: contact.contactId,
          rule_id: rule.automation_rule_id,
          executionDateTime: contact.executionDateTime,
        });

        await sendWhatsAppMessage(
          contact.contactId,
          rule.automation_rule_id,
          campaign_name,
          tracker_ref_name,
          contact.executionDateTime,
          encryptionKeys,
        );
      }
    }

    console.log('💥💥💥💥💥💥💥 END LOG💥💥💥💥💥💥💥');
  }

  async function messageContactAfterRegistration(rule, encryptionKeys) {
    console.log('💥💥💥💥💥💥💥START AUTOMATION LOG💥💥💥💥💥💥💥');
    console.log(
      '💥💥💥💥💥💥💥 Messafe contact after registration 💥💥💥💥💥💥💥',
    );
    const execTime =
      getExecutionTime(rule) !== -1
        ? getExecutionTime(rule)
            .subtract(5, 'minutes')
            .format('YYYY-MM-DD H:m:s')
        : moment().subtract(5, 'minutes').format('YYYY-MM-DD H:m:s');
    const nowTime =
      getExecutionTime(rule) !== -1
        ? moment(execTime).add(5, 'minutes').format('YYYY-MM-DD H:m:s')
        : moment().format('YYYY-MM-DD H:m:s');

    const execDate =
      getExecutionTime(rule) !== -1
        ? getExecutionTime(rule).format('YYYY-MM-DD')
        : moment().format('YYYY-MM-DD');

    const contacts = [];
    const agencyId = rule?.automation_category?.agency_fk;
    if (h.notEmpty(rule?.automation_rule_packages)) {
      for (const pckg of rule?.automation_rule_packages) {
        if (pckg.dataValues.mindbody_package) {
          const membership = await mindBodyClientContractCtlr.findAll(
            {
              payload: {
                [rule?.exclude_package === '0'
                  ? Op.like
                  : Op.notLike]: `%"ContractID":${pckg.dataValues.mindbody_package.package_id}%`,
              },
            },
            {
              include: [
                {
                  model: models.contact,
                  required: true,
                  where: {
                    agency_fk: agencyId,
                    created_date: {
                      [Op.between]: [new Date(execTime), new Date(nowTime)],
                    },
                    [Op.or]: [
                      {
                        whatsapp_engagement: 'all',
                      },
                      {
                        whatsapp_engagement: {
                          [Op.like]: `%automation%`,
                        },
                      },
                    ],
                  },
                  include: [
                    {
                      model: models.agency_user,
                      required: true,
                    },
                    {
                      model: models.contact_source,
                      require: true,
                      where: {
                        source_type: 'MINDBODY',
                        [Op.or]: [
                          {
                            source_original_payload: {
                              [Op.like]: `%"creationDateTime":"${execDate}%`,
                            },
                          },
                          {
                            source_original_payload: {
                              [Op.like]: `%"CreationDate":"${execDate}T00:00:00"%`,
                            },
                          },
                        ],
                      },
                    },
                    {
                      model: models.mindbody_client_visits,
                      required: false,
                    },
                  ],
                },
              ],
            },
          );

          for (const member of membership) {
            const contactIds = contacts.map((m) => m.contactId);
            if (
              !contactIds.includes(member.contact_fk) &&
              h.general.isEmpty(member.mindbody_client_visits)
            ) {
              contacts.push({
                contactId: member.contact_fk,
                executionDateTime: execTime,
              });
            }
          }
        }
      }
    } else {
      const mbContacts = await contactCtlr.findAll(
        {
          agency_fk: agencyId,
          created_date: {
            [Op.between]: [new Date(execTime), new Date(nowTime)],
          },
          [Op.or]: [
            {
              whatsapp_engagement: 'all',
            },
            {
              whatsapp_engagement: {
                [Op.like]: `%automation%`,
              },
            },
          ],
        },
        {
          include: [
            {
              model: models.contact_source,
              require: true,
              where: {
                source_type: 'MINDBODY',
                [Op.or]: [
                  {
                    source_original_payload: {
                      [Op.like]: `%"creationDateTime":"${execDate}%`,
                    },
                  },
                  {
                    source_original_payload: {
                      [Op.like]: `%"CreationDate":"${execDate}T00:00:00"%`,
                    },
                  },
                ],
              },
            },
            {
              model: models.agency_user,
              required: true,
            },
            {
              model: models.mindbody_client_contracts,
              required: false,
            },
            {
              model: models.mindbody_client_visits,
              required: false,
            },
            {
              model: models.mindbody_client_services,
              required: false,
            },
          ],
        },
      );

      for (const contact of mbContacts) {
        if (
          !contacts.includes(contact.contact_id) &&
          ((h.general.notEmpty(contact.mindbody_client_visits) &&
            h.general.isEmpty(contact.mindbody_client_contracts) &&
            h.general.isEmpty(contact.mindbody_client_services)) ||
            (h.general.isEmpty(contact.mindbody_client_contracts) &&
              h.general.isEmpty(contact.mindbody_client_visits) &&
              h.general.isEmpty(contact.mindbody_client_services)))
        ) {
          contacts.push({
            contactId: contact.contact_id,
            executionDateTime: execTime,
          });
        }
      }
    }

    if (h.notEmpty(contacts)) {
      const agency = agencyCtr.findOne({ agency_id: agencyId });
      const agencyRecord = agency.dataValues;
      const campaign_name = `Automated Message ${agencyId} ${Date.now()}`;
      const tracker_ref_name = `${agencyId}_${Date.now()}_automation_${
        agencyRecord?.agency_name.replaceAll(' ', '_').toLowerCase() || 'agency'
      }`;

      const { agency_config_id, whatsapp_config } =
        await models.agency_config.findOne({
          where: { agency_fk: agencyId },
        });
      const wa_config = JSON.parse(whatsapp_config);
      console.log(wa_config);
      let saved_quick_replies = !h.isEmpty(wa_config.quick_replies)
        ? wa_config.quick_replies
        : [];
      const new_whatsapp_config = {
        is_enabled: wa_config.is_enabled,
        environment: wa_config.environment,
        quick_replies: saved_quick_replies,
      };

      // setup messaging config
      const cta = [];
      const automation_template = await automationRuleTemplateCtr.findOne({
        automation_rule_fk: rule.automation_rule_id,
      });

      const waba_template = await wabaTemplateCtr.findOne({
        waba_template_id: automation_template.template_fk,
      });

      // console.log(waba_template);
      const template = waba_template.dataValues;
      const selected_template = JSON.parse(template.content);
      const cta_option_type = [];
      for (let index = 0; index < 10; index++) {
        cta_option_type.push(
          automation_template[`cta_${index + 1}_option_type`],
        );
      }
      selected_template.components.forEach((component) => {
        if (h.cmpStr(component.type, 'BUTTONS')) {
          let qr_index = 0;
          component.buttons.forEach((btn, index) => {
            if (h.cmpStr(btn.type, 'QUICK_REPLY')) {
              cta.push(btn.text);
              saved_quick_replies = h.whatsapp.checkIfQRIsCheckedAnMonitored(
                cta_option_type[qr_index],
                btn.text,
                saved_quick_replies,
              );
              qr_index++;
            }
          });
        }
      });

      if (!h.isEmpty(cta)) {
        console.log(cta);
        new_whatsapp_config.quick_replies = saved_quick_replies;
        await agencyConfigCtl.update(agency_config_id, {
          whatsapp_config: JSON.stringify(new_whatsapp_config),
        });
        const campaignCtaData = {
          campaign_tracker_ref_name: tracker_ref_name,
          campaign_notification_additional_recipients: null,
          is_confirmation: false,
        };
        for (let index = 0; index < 10; index++) {
          campaignCtaData[`cta_${index + 1}`] = !h.isEmpty(cta[index])
            ? cta[index]
            : null;
          campaignCtaData[`cta_${index + 1}_response`] =
            automation_template[`cta_${index + 1}_response`];
          campaignCtaData[`trigger_cta_${index + 1}_options`] =
            automation_template[`trigger_cta_${index + 1}_options`];
          campaignCtaData[`cta_${index + 1}_final_response`] =
            automation_template[`cta_${index + 1}_final_response`];
          campaignCtaData[`cta_${index + 1}_option_type`] =
            automation_template[`cta_${index + 1}_option_type`];
        }
        await campaignCtaCtl.create(campaignCtaData);
      }
      for (const contact of contacts) {
        console.log({
          contact_id: contact.contactId,
          rule_id: rule.automation_rule_id,
          executionDateTime: contact.executionDateTime,
        });

        await sendWhatsAppMessage(
          contact.contactId,
          rule.automation_rule_id,
          campaign_name,
          tracker_ref_name,
          contact.executionDateTime,
          encryptionKeys,
        );
      }
    }
  }

  /**
   * Description
   * Function to send message for automation purposes
   * @async
   * @function
   * @name sendWhatsAppMessage
   * @kind function
   * @param {string} contact_id
   * @param {string} rule_id
   * @param {string} campaign_name
   * @param {string} tracker_ref_name
   * @param {date} execution_date_time
   * @param {object} encryptionKeys
   */
  async function sendWhatsAppMessage(
    contact_id,
    rule_id,
    campaign_name,
    tracker_ref_name,
    execution_date_time,
    encryptionKeys,
  ) {
    // get template and contact record
    const [{ template_fk }, contact] = await Promise.all([
      automationRuleTemplateCtr.findOne({
        automation_rule_fk: rule_id,
      }),
      contactCtlr.findOne({
        contact_id,
      }),
    ]);

    const contactRecord = contact.dataValues;

    const [waba_template, contactAgency] = await Promise.all([
      wabaTemplateCtr.findOne({
        waba_template_id: template_fk,
      }),
      agencyCtr.findOne({
        agency_id: contactRecord?.agency_fk,
      }),
    ]);

    const template = waba_template.dataValues;
    const buyerFirstName = contactRecord.first_name;
    const permalink = await getContactPermalink(contactRecord);
    const agency_user_id = await getCurrentAgencyUserForAutomation(
      contactRecord,
    );

    const [agency_whatsapp_config, userAgent, agency] = await Promise.all([
      agencyWhatsAppConfigCtr.findOne({
        waba_number: template.waba_number,
        is_active: true,
      }),
      models.agency_user.findOne({
        where: {
          agency_user_id: agency_user_id,
        },
        include: [{ model: models.user, required: true }],
      }),
      agencyCtr.findOne({ agency_id: contactRecord.agency_fk }),
    ]);

    if (h.isEmpty(agency_whatsapp_config)) {
      console.log({
        message:
          'SENDING AUTOMATION MESSAGE WILL NOT CONTINUE - WABA NUMBER NOT ACTIVE',
      });
    } else {
      const waba = agency_whatsapp_config.dataValues;
      const agencyRecord = agency.dataValues;
      const userRecord = userAgent.dataValues.user.dataValues;

      const { whatsapp_config } = await models.agency_config.findOne({
        where: { agency_fk: waba?.agency_fk },
      });

      const config = JSON.parse(whatsapp_config);
      const environment = config.environment;

      const sendPermalink = h.route.createPermalink(
        agencyRecord?.agency_subdomain,
        config.webUrl,
        agencyRecord?.agency_name,
        contactRecord,
        permalink,
      );

      const api_credentials = Buffer.from(
        `${waba?.agency_whatsapp_api_token}:${waba?.agency_whatsapp_api_secret}`,
        'utf8',
      ).toString('base64');

      const { sendMessagePartsData, msg_body } =
        await h.whatsapp.getTemplateMsgBody(
          agencyRecord?.agency_id,
          agencyRecord?.agency_name,
          h.general.prettifyConstant(userRecord.first_name),
          buyerFirstName,
          contactRecord?.mobile_number,
          contactRecord?.email,
          sendPermalink,
          [template],
        );

      const { sendWhatsAppTemplateMessageResponse, failed_reason } =
        await sendAutomationTemplateMesage({
          contactRecord,
          sendMessagePartsData,
          api_credentials,
          environment,
        });

      const automation_broadcast_date = new Date();
      const msg_timestamp = Math.floor(
        automation_broadcast_date.getTime() / 1000,
      );

      // process saving message record
      await saveAutomationMessageData({
        rule_id,
        waba,
        agencyRecord,
        contact_id,
        contactRecord,
        campaign_name,
        tracker_ref_name,
        agency_user_id,
        sendWhatsAppTemplateMessageResponse,
        failed_reason,
        msg_body,
        msg_template_id: template?.waba_template_id,
        msg_category: template?.category,
        msg_timestamp,
      });

      // process making contact status inactive when message failed
      if (
        h.isEmpty(sendWhatsAppTemplateMessageResponse?.original_event_id) &&
        !h.cmpStr(contactRecord?.status, 'archived') &&
        h.cmpBool(
          sendWhatsAppTemplateMessageResponse?.failed_due_to_subscription,
          false,
        )
      ) {
        await setContactAsInactiveDueToFailedMessage(
          agencyRecord?.agency_id,
          contact_id,
          contactRecord?.mobile_number,
        );
      }

      // send appsync notification message
      await processSendAppsyncMessageNotification({
        sendWhatsAppTemplateMessageResponse,
        campaign_name,
        agencyRecord,
        contactRecord,
        contact_id,
        agency_user_id,
        msg_body,
        msg_timestamp,
        waba,
      });

      // process inventory and trigger salesforce transmission
      if (h.notEmpty(sendWhatsAppTemplateMessageResponse.original_event_id)) {
        await messageInventory.addMessageCount(agencyRecord?.agency_id);
        await agencyNotification.checkMessageCapacityAfterUpdate(
          agencyRecord?.agency_id,
        );
        await processSalesforceMessageTransmission({
          contact_id,
          contact,
          agencyRecord,
          agency_user_id,
          msg_body,
          encryptionKeys,
        });
      }
    }
  }

  /**
   * Description
   * Function to trigger sending whatsapp automation message
   * @async
   * @function
   * @name sendAutomationTemplateMesage
   * @kind function
   * @param {object} agency_id automation contact record
   * @param {object} sendMessagePartsData message to send
   * @param {string} api_credentials waba credentials
   * @param {string} environment waba environment
   * @returns {Promise} returns the sending response
   */
  async function sendAutomationTemplateMesage({
    contactRecord,
    sendMessagePartsData,
    api_credentials,
    environment,
  }) {
    const canContinueAutomationSending =
      await messageInventory.checkIfCanSendMessage(contactRecord?.agency_fk);
    let sendWhatsAppTemplateMessageResponse;
    let failed_reason = null;
    let can_send_automation = true;
    let failed_due_to_subscription = false;

    if (
      h.cmpStr(contactRecord?.status, 'inactive') ||
      h.cmpStr(contactRecord?.status, 'archived')
    ) {
      can_send_automation = false;
      sendWhatsAppTemplateMessageResponse = { original_event_id: null };
      const reason =
        contactRecord?.status.charAt(0).toUpperCase() +
        contactRecord?.status.slice(1);
      failed_reason = JSON.stringify([{ code: 100000, title: reason }]);
    }

    const whatsapp_engagement_status = contactRecord?.whatsapp_engagement;
    const whatsapp_engagement_enabled =
      h.cmpStr(whatsapp_engagement_status, 'all') ||
      whatsapp_engagement_status.includes('automation');

    if (
      h.cmpBool(can_send_automation, true) &&
      h.cmpBool(whatsapp_engagement_enabled, false)
    ) {
      can_send_automation = false;
      sendWhatsAppTemplateMessageResponse = { original_event_id: null };
      const reason = 'WhatsApp engagement disabled';
      failed_reason = JSON.stringify([{ code: 100000, title: reason }]);
    }

    if (
      h.cmpBool(can_send_automation, true) &&
      h.cmpBool(contactRecord?.opt_out_whatsapp, true)
    ) {
      can_send_automation = false;
      sendWhatsAppTemplateMessageResponse = { original_event_id: null };
      const reason = 'Contact opted out';
      failed_reason = JSON.stringify([{ code: 100000, title: reason }]);
    }

    if (
      h.cmpBool(can_send_automation, true) &&
      h.cmpBool(canContinueAutomationSending.can_continue, false)
    ) {
      can_send_automation = false;
      sendWhatsAppTemplateMessageResponse = { original_event_id: null };
      const reason = h.general.getMessageByCode(
        canContinueAutomationSending.reason,
      );
      failed_reason = JSON.stringify([{ code: 100000, title: reason }]);
      failed_due_to_subscription = true;
    }

    if (h.cmpBool(can_send_automation, false)) {
      return { sendWhatsAppTemplateMessageResponse, failed_reason };
    }

    sendWhatsAppTemplateMessageResponse =
      await h.whatsapp.sendWhatsAppTemplateMessage(
        contactRecord?.mobile_number,
        0,
        null,
        sendMessagePartsData,
        api_credentials,
        environment,
        null,
      );

    return {
      sendWhatsAppTemplateMessageResponse,
      failed_reason,
      failed_due_to_subscription,
    };
  }

  /**
   * Description
   * Function to save message record in whatsap_chat, whatsapp_message_tracker
   * and unified_inbox
   * @async
   * @function
   * @name saveAutomationMessageData
   * @param {object} params messsage data object
   */
  async function saveAutomationMessageData(params) {
    const {
      rule_id,
      waba,
      agencyRecord,
      contact_id,
      contactRecord,
      campaign_name,
      tracker_ref_name,
      agency_user_id,
      sendWhatsAppTemplateMessageResponse,
      failed_reason,
      msg_body,
      msg_template_id,
      msg_category,
      msg_timestamp,
    } = params;

    const messageData = {
      campaign_name: campaign_name,
      msg_id: rule_id,
      agency_fk: agencyRecord?.agency_id,
      contact_fk: contact_id,
      agency_user_fk: agency_user_id,
      msg_body: msg_body,
      sender_number: waba?.waba_number,
      sender_url: `whatsappcloud://${waba?.waba_number}@`,
      receiver_number: contactRecord?.mobile_number,
      receiver_url: `whatsappcloud://${contactRecord?.mobile_number}@whatsapp.com`,
      sent: h.notEmpty(sendWhatsAppTemplateMessageResponse.original_event_id),
      failed: h.isEmpty(sendWhatsAppTemplateMessageResponse.original_event_id),
      failed_reason: failed_reason,
      created_by: null,
      updated_by: null,
    };
    const hasUnifiedEntry = await unifiedInboxCtr.findOne({
      agency_fk: agencyRecord?.agency_id,
      contact_fk: contact_id,
      receiver: contactRecord?.mobile_number,
      msg_platform: 'whatsapp',
      tracker_type: 'main',
    });
    const message_tx = await models.sequelize.transaction();
    try {
      const whatsapp_message_tracker_id =
        await whatsappMessageTrackerCtr.create(
          {
            ...messageData,
            campaign_name_label: campaign_name,
            tracker_ref_name,
            original_event_id: !h.isEmpty(
              sendWhatsAppTemplateMessageResponse.original_event_id,
            )
              ? sendWhatsAppTemplateMessageResponse.original_event_id
              : null,
            msg_origin: 'automation',
            pending: 0,
            failed_reason: failed_reason,
            batch_count: 1,
            broadcast_date: new Date(),
            template_count: 1,
            tracker_type: 'main',
            visible: 0,
          },
          { transaction: message_tx },
        );

      await whatsAppChatCtr.create(
        {
          ...messageData,
          msg_timestamp,
          original_event_id: !h.isEmpty(
            sendWhatsAppTemplateMessageResponse.original_event_id,
          )
            ? sendWhatsAppTemplateMessageResponse.original_event_id
            : null,
          msg_type: 'frompave',
          msg_origin: 'automation',
          failed_reason: failed_reason,
          msg_template_id,
          msg_category,
        },
        { transaction: message_tx },
      );

      delete messageData.sender_number;
      delete messageData.receiver_number;
      delete messageData.sender_url;
      delete messageData.receiver_url;
      if (h.isEmpty(hasUnifiedEntry)) {
        await unifiedInboxCtr.create(
          {
            ...messageData,
            tracker_id: whatsapp_message_tracker_id,
            tracker_ref_name,
            sender: waba?.waba_number,
            receiver: contactRecord?.mobile_number,
            event_id: !h.isEmpty(
              sendWhatsAppTemplateMessageResponse.original_event_id,
            )
              ? sendWhatsAppTemplateMessageResponse.original_event_id
              : null,
            msg_type: 'frompave',
            msg_platform: 'whatsapp',
            pending: 0,
            batch_count: 1,
            broadcast_date: new Date(),
            last_msg_date: new Date(),
            template_count: 1,
            tracker_type: 'main',
          },
          { transaction: message_tx },
        );
      } else {
        await unifiedInboxCtr.update(
          hasUnifiedEntry?.unified_inbox_id,
          {
            ...messageData,
            tracker_id: whatsapp_message_tracker_id,
            tracker_ref_name,
            receiver: contactRecord?.mobile_number,
            sender: waba?.waba_number,
            event_id: !h.isEmpty(
              sendWhatsAppTemplateMessageResponse.original_event_id,
            )
              ? sendWhatsAppTemplateMessageResponse.original_event_id
              : null,
            msg_type: 'frompave',
            msg_platform: 'whatsapp',
            pending: 0,
            batch_count: 1,
            broadcast_date: new Date(),
            last_msg_date: new Date(),
            template_count: 1,
            tracker_type: 'main',
          },
          null,
          { transaction: message_tx },
        );
      }
      await message_tx.commit();
    } catch (err) {
      await message_tx.rollback();
      Sentry.captureException(err);
      console.log(err);
    }
  }

  /**
   * Description
   * Function to get the agency user id for contact
   * @async
   * @function
   * @name getCurrentAgencyUserForAutomation
   * @kind function
   * @memberof makeController.makeController
   * @param {object} contactRecord contact record for automation
   * @returns {Promise} returns the agency user id
   */
  async function getCurrentAgencyUserForAutomation(contactRecord) {
    let agency_user_id = contactRecord?.agency_user_fk;
    if (h.isEmpty(agency_user_id)) {
      const currentUserAgency = await models.user.findOne({
        where: {
          email: {
            [Op.like]: `%support%`,
          },
        },
        include: [
          {
            model: models.agency_user,
            where: {
              agency_fk: contactRecord?.agency_fk,
            },
          },
        ],
      });
      agency_user_id = currentUserAgency.agency_user.dataValues.agency_user_id;
    }

    return agency_user_id;
  }

  /**
   * Description
   * Function to get permalink code for contact
   * @async
   * @function
   * @name getContactPermalink
   * @kind function
   * @param {any} contactRecord
   * @returns {Promise} permalink code for contact
   */
  async function getContactPermalink(contactRecord) {
    const permalink = h.notEmpty(contactRecord.permalink)
      ? contactRecord.permalink
      : await contactService.checkIfPermalinkIsUnique(
          h.general.generateRandomAlpanumeric(5),
        );
    return permalink;
  }

  /**
   * Description
   * Function to get the contact owner id
   * @async
   * @function
   * @name getContactOwner
   * @param {object} contactRecord contact record
   * @returns {Promise} return the contact owner id depending on the contact and
   * agency data
   */
  async function getContactOwner(contactRecord) {
    let agency_user_id = contactRecord?.agency_user_fk;
    if (h.isEmpty(agency_user_id)) {
      const { default_outsider_contact_owner } = await agencyCtr.findOne({
        agency_id: contactRecord.agency_fk,
      });
      agency_user_id = default_outsider_contact_owner;
      if (h.isEmpty(agency_user_id)) {
        const currentUserAgency = await models.user.findOne({
          where: {
            email: {
              [Op.like]: `%support%`,
            },
          },
          include: [
            {
              model: models.agency_user,
              where: {
                agency_fk: contactRecord.agency_fk,
              },
            },
          ],
        });
        agency_user_id =
          currentUserAgency.agency_user.dataValues.agency_user_id;
      }
    }

    return agency_user_id;
  }

  /**
   * Description
   * Function to process sending message to salesforce record
   * @async
   * @function
   * @name processSalesforceMessageTransmission
   * @kind function
   * @param {string} contact_id contact id
   * @param {object} agencyRecord agency data
   * @param {string} agency_user_id contact owner id
   * @param {object} contact contact data
   * @param {string} msg_body message
   * @param {object} encryptionKeys additional consumer data for encryption
   */
  async function processSalesforceMessageTransmission({
    contact_id,
    agencyRecord,
    agency_user_id,
    contact,
    msg_body,
    encryptionKeys,
  }) {
    const contact_source = await models.contact_source.findOne({
      where: {
        contact_fk: contact_id,
        source_type: 'SALESFORCE',
      },
    });
    if (
      h.notEmpty(contact_source) &&
      h.notEmpty(contact_source?.source_contact_id)
    ) {
      const liveChatSettings = await models.live_chat_settings.findOne({
        where: {
          agency_fk: agencyRecord?.agency_id,
        },
      });

      const agencyOauth = await models.agency_oauth.findOne({
        where: {
          agency_fk: agencyRecord?.agency_id,
          status: 'active',
          source: 'SALESFORCE',
        },
      });
      const currentAgencyUser = await models.agency_user.findOne({
        where: {
          agency_user_id: agency_user_id,
        },
        include: [
          { model: models.user, required: true },
          { model: models.agency, required: true },
        ],
      });
      const contactSalesforceRecord = await contactSalesforceData.findOne(
        {
          agency_fk: agencyRecord?.agency_id,
          contact_fk: contact_id,
        },
        {
          order: [['created_date', 'DESC']],
        },
      );
      try {
        await h.salesforce.transmitMessage({
          liveChatSettings,
          contactSalesforceData: contactSalesforceRecord,
          agencyOauth,
          contact,
          contact_source,
          currentAgencyUser,
          full_message_body: msg_body,
          messageType: 'template',
          platform: 'whatsapp',
          encryptionKeys,
        });
      } catch (transmissionErr) {
        Sentry.captureException(transmissionErr);
        console.error({
          action: 'FAILED SF TRANSMISSION ERROR',
          response: transmissionErr,
          stringifiedErr: JSON.stringify(transmissionErr),
        });
        throw new Error('FAILED SF TRANSMISSION ERROR');
      }
    }
  }

  /**
   * Description
   * Function for transmitting mesage data to appsync
   * @async
   * @function
   * @name processSendAppsyncMessageNotification
   * @kind function
   * @param {object} sendWhatsAppTemplateMessageResponse message sending response
   * @param {string} campaign_name automation name
   * @param {object} agencyRecord agency data
   * @param {object} contactRecord contact data
   * @param {string} contact_id contact id
   * @param {string} agency_user_id contact owner id
   * @param {string} msg_body message
   * @param {timestamp} msg_timestamp message timestamp
   * @param {object} waba waba data
   */
  async function processSendAppsyncMessageNotification({
    sendWhatsAppTemplateMessageResponse,
    campaign_name,
    agencyRecord,
    contactRecord,
    contact_id,
    agency_user_id,
    msg_body,
    msg_timestamp,
    waba,
  }) {
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
    const appsync = await appSyncCredentials.findOne({
      status: 'active',
    });
    const { api_key } = appsync;
    await h.appsync.sendGraphQLNotification(api_key, {
      position: 1,
      platform: 'whatsapp',
      failed: h.isEmpty(sendWhatsAppTemplateMessageResponse.original_event_id),
      campaign_name: campaign_name,
      agency_fk: agencyRecord?.agency_id,
      contact_fk: contact_id,
      agency_user_fk: agency_user_id,
      original_event_id: !h.isEmpty(
        sendWhatsAppTemplateMessageResponse.original_event_id,
      )
        ? sendWhatsAppTemplateMessageResponse.original_event_id
        : null,
      msg_id: null,
      msg_body: msg_body,
      msg_type: 'frompave',
      msg_timestamp,
      sender_number: waba?.waba_number,
      sender_url: `whatsappcloud://${waba?.waba_number}@`,
      receiver_number: contactRecord?.mobile_number,
      receiver_url: `whatsappcloud://${contactRecord?.mobile_number}@whatsapp.com`,
      reply_to_event_id: null,
      reply_to_content: null,
      reply_to_msg_type: null,
      reply_to_file_name: null,
      reply_to_contact_id: null,
      created_date_raw: new Date(),
      created_date: `${formattedDate} ${formattedTime}`,
    });
  }

  /**
   * Description
   * Function to set contact status to active when a campaign message failed
   * @async
   * @function
   * @name setContactAsInactiveDueToFailedMessage
   * @kind function
   * @param {string} agency_id agency ID
   * @param {string} contact_id contact ID
   * @param {string} mobile_number contact mobile number
   */
  async function setContactAsInactiveDueToFailedMessage(
    agency_id,
    contact_id,
    mobile_number,
  ) {
    console.log({
      message:
        'Setting contact status to inactive due to failed message sending',
      data: {
        agency_id,
        contact_id,
        mobile_number,
      },
    });
    const contact_tx = await models.sequelize.transaction();
    try {
      await models.contact.update(
        {
          status: 'inactive',
        },
        {
          where: {
            [Op.or]: [{ contact_id }, { agency_fk: agency_id, mobile_number }],
          },
          transaction: contact_tx,
        },
      );
      await contact_tx.commit();
    } catch (contactErr) {
      await contact_tx.rollback();
      Sentry.captureException(contactErr);
      console.error({
        action: 'FAILED MESSAGE CONTACT SET INACTIVE ERROR',
        response: contactErr,
        stringifiedErr: JSON.stringify(contactErr),
      });
      throw new Error('FAILED MESSAGE CONTACT SET INACTIVE ERROR');
    }
  }

  function getExecutionTime(rule) {
    if (rule.rule_trigger_setting === 'immediately') {
      return -1;
    }

    if (rule.rule_trigger_setting === 'day') {
      return moment()
        .utc(true)
        .subtract(parseInt(rule.rule_trigger_setting_count), 'days');
    }

    if (rule.rule_trigger_setting === 'week') {
      return moment()
        .utc(true)
        .subtract(parseInt(rule.rule_trigger_setting_count), 'weeks');
    }
  }

  function getExecutionBeforeDate(rule) {
    if (rule.rule_trigger_setting === 'immediately') {
      return -1;
    }

    if (rule.rule_trigger_setting === 'day') {
      return moment()
        .utc(true)
        .add(parseInt(rule.rule_trigger_setting_count), 'days');
    }

    if (rule.rule_trigger_setting === 'week') {
      return moment()
        .utc(true)
        .add(parseInt(rule.rule_trigger_setting_count), 'weeks');
    }
  }

  function canEngage(contact, type) {
    return (
      contact.whatsapp_engagement === 'all' ||
      contact.whatsapp_engagement.includes(type)
    );
  }

  ctlr.getClientCompleteInfo = async (agency_fk, clientId) => {
    const mindBodySetting = await agencyOauthCtlr.findOne({
      source: 'MINDBODY',
      status: 'active',
      agency_fk,
    });

    if (h.isEmpty(mindBodySetting)) {
      return;
    }

    const { access_info } = mindBodySetting;

    const accessInfo = JSON.parse(access_info);
    const { siteId, apiKey } = accessInfo;

    const mindbodyApi = new MindBodyAPI(siteId, apiKey);

    const params = {
      clientId,
    };

    try {
      // Get MB Client Info
      const info = await mindbodyApi.getClientCompleteInfo(params);

      return info.Client;
    } catch (err) {
      Sentry.captureException(err);
      return null;
    }
  };

  ctlr.updateClientInfo = async (agency_fk, clientId, contactId) => {
    const mindBodySetting = await agencyOauthCtlr.findOne({
      source: 'MINDBODY',
      status: 'active',
      agency_fk,
    });

    if (h.isEmpty(mindBodySetting)) {
      return;
    }

    const { access_info } = mindBodySetting;

    const accessInfo = JSON.parse(access_info);
    const { siteId, apiKey } = accessInfo;

    const mindbodyApi = new MindBodyAPI(siteId, apiKey);

    const params = {
      clientId,
    };

    try {
      // Get MB Client Info
      const info = await mindbodyApi.getClientCompleteInfo(params);
      // Update Client memberships/packages
      // Clear exising memberships
      await h.database.transaction(async (transaction) => {
        await mindbodyMembershipCtlr.destroyAll(
          {
            contact_fk: contactId,
          },
          {
            transaction,
          },
        );
      });

      // Save membeships
      if (h.general.notEmpty(info.ClientMemberships)) {
        for (const membership of info.ClientMemberships) {
          await h.database.transaction(async (transaction) => {
            await mindbodyMembershipCtlr.create(
              {
                contact_fk: contactId,
                payload: JSON.stringify(membership),
              },
              {
                transaction,
              },
            );
          });
        }
      }

      // Update Client Client Contracts
      // Clear exising contracts
      await h.database.transaction(async (transaction) => {
        await mindBodyClientContractCtlr.destroyAll(
          {
            contact_fk: contactId,
          },
          {
            transaction,
          },
        );
      });

      // Save contracts
      if (h.general.notEmpty(info.ClientContracts)) {
        for (const contract of info.ClientContracts) {
          await h.database.transaction(async (transaction) => {
            await mindBodyClientContractCtlr.create(
              {
                contact_fk: contactId,
                payload: JSON.stringify(contract),
              },
              {
                transaction,
              },
            );
          });
        }
      }

      // Update Client Client visits
      // Clear exising contracts
      await h.database.transaction(async (transaction) => {
        await mindBodyClientVisitCtlr.destroyAll(
          {
            contact_fk: contactId,
          },
          {
            transaction,
          },
        );
      });

      // Save visits
      if (h.general.notEmpty(info.ClientArrivals)) {
        for (const visit of info.ClientArrivals) {
          await h.database.transaction(async (transaction) => {
            await mindBodyClientVisitCtlr.create(
              {
                contact_fk: contactId,
                payload: JSON.stringify(visit),
              },
              {
                transaction,
              },
            );
          });
        }
      }

      // Update Client Client Services
      // Clear exising Services
      await h.database.transaction(async (transaction) => {
        await mindBodyClientServicesCtlr.destroyAll(
          {
            contact_fk: contactId,
          },
          {
            transaction,
          },
        );
      });

      // Save visits
      if (h.general.notEmpty(info.ClientServices)) {
        for (const service of info.ClientServices) {
          await h.database.transaction(async (transaction) => {
            await mindBodyClientServicesCtlr.create(
              {
                contact_fk: contactId,
                payload: JSON.stringify(service),
              },
              {
                transaction,
              },
            );
          });
        }
      }
    } catch (err) {
      Sentry.captureException(err);
      return null;
    }
  };

  function getContactDetails(details) {
    return {
      // source_payload: details,
      last_name: details.LastName,
      email: details.Email,
      mobile: details.MobilePhone,
      sourceId: details.Id,
    };
  }

  ctlr.updateMindbodyContact = async (agency_fk, contactId, clientId) => {
    const mindBodySetting = await agencyOauthCtlr.findOne({
      source: 'MINDBODY',
      status: 'active',
      agency_fk,
    });

    if (h.isEmpty(mindBodySetting)) {
      return;
    }

    const { access_info } = mindBodySetting;

    const accessInfo = JSON.parse(access_info);
    const { siteId, apiKey } = accessInfo;

    const mindbodyApi = new MindBodyAPI(siteId, apiKey);

    const params = {
      clientId,
      startDate: moment().startOf('year').format('YYYY-MM-DDTHH:mm:ssZ'),
      endDate: moment().endOf('year').format('YYYY-MM-DDTHH:mm:ssZ'),
    };
    try {
      // Get Contact visits
      const visits = await mindbodyApi.getClientVisits(params);

      // Get Contact memberships
      const memberships = await mindbodyApi.getActiveMemberships({
        clientId,
      });

      // Get Contact contracts
      const contracts = await mindbodyApi.getClientContracts({
        clientId,
      });

      // Get Contact complete info
      const contactInfo = await mindbodyApi.getClientCompleteInfo({ clientId });

      // Update Client memberships/packages
      // Clear exising memberships
      await h.database.transaction(async (transaction) => {
        await mindbodyMembershipCtlr.destroyAll(
          {
            contact_fk: contactId,
          },
          {
            transaction,
          },
        );
      });

      // Save membeships
      if (h.general.notEmpty(memberships.ClientMemberships)) {
        for (const membership of memberships.ClientMemberships) {
          await h.database.transaction(async (transaction) => {
            await mindbodyMembershipCtlr.create(
              {
                contact_fk: contactId,
                payload: JSON.stringify(membership),
              },
              {
                transaction,
              },
            );
          });
        }
      }

      // Update Client Client Contracts
      // Clear exising contracts
      await h.database.transaction(async (transaction) => {
        await mindBodyClientContractCtlr.destroyAll(
          {
            contact_fk: contactId,
          },
          {
            transaction,
          },
        );
      });

      // Save contracts
      if (h.general.notEmpty(contracts.Contracts)) {
        for (const contract of contracts.Contracts) {
          await h.database.transaction(async (transaction) => {
            await mindBodyClientContractCtlr.create(
              {
                contact_fk: contactId,
                payload: JSON.stringify(contract),
              },
              {
                transaction,
              },
            );
          });
        }
      }

      // Update Client Client visits
      // Clear exising contracts
      await h.database.transaction(async (transaction) => {
        await mindBodyClientVisitCtlr.destroyAll(
          {
            contact_fk: contactId,
          },
          {
            transaction,
          },
        );
      });

      // Save visits
      if (h.general.notEmpty(visits.Visits)) {
        for (const visit of visits.Visits) {
          await h.database.transaction(async (transaction) => {
            await mindBodyClientVisitCtlr.create(
              {
                contact_fk: contactId,
                payload: JSON.stringify(visit),
              },
              {
                transaction,
              },
            );
          });
        }
      }

      // Update Client Client Services
      // Clear exising Services
      await h.database.transaction(async (transaction) => {
        await mindBodyClientServicesCtlr.destroyAll(
          {
            contact_fk: contactId,
          },
          {
            transaction,
          },
        );
      });

      // Save visits
      if (h.general.notEmpty(contactInfo.ClientServices)) {
        for (const service of contactInfo.ClientServices) {
          await h.database.transaction(async (transaction) => {
            await mindBodyClientServicesCtlr.create(
              {
                contact_fk: contactId,
                payload: JSON.stringify(service),
              },
              {
                transaction,
              },
            );
          });
        }
      }

      // Update contact source
      await h.database.transaction(async (transaction) => {
        await contactSrcCtlr.update(
          clientId,
          { source_original_payload: JSON.stringify(contactInfo.Client) },
          {
            transaction,
          },
        );
      });
    } catch (err) {
      Sentry.captureException(err);
      console.log(err);
    }
  };

  ctlr.updateMindbodyVisit = async (agency_fk, contactId, clientId) => {
    const mindBodySetting = await agencyOauthCtlr.findOne({
      source: 'MINDBODY',
      status: 'active',
      agency_fk,
    });

    if (h.isEmpty(mindBodySetting)) {
      return;
    }

    const { access_info } = mindBodySetting;

    const accessInfo = JSON.parse(access_info);
    const { siteId, apiKey } = accessInfo;

    const mindbodyApi = new MindBodyAPI(siteId, apiKey);

    // Get Contact complete info
    const contactInfo = await mindbodyApi.getClientCompleteInfo({ clientId });

    const params = {
      clientId,
      startDate: moment().startOf('year').format('YYYY-MM-DDTHH:mm:ssZ'),
      endDate: moment().endOf('year').format('YYYY-MM-DDTHH:mm:ssZ'),
    };
    try {
      // Get Contact visits
      const visits = await mindbodyApi.getClientVisits(params);

      // Update Client Client visits
      // Clear exising contracts
      await h.database.transaction(async (transaction) => {
        await mindBodyClientVisitCtlr.destroyAll(
          {
            contact_fk: contactId,
          },
          {
            transaction,
          },
        );
      });

      // Save visits
      if (h.general.notEmpty(visits.Visits)) {
        for (const visit of visits.Visits) {
          await h.database.transaction(async (transaction) => {
            await mindBodyClientVisitCtlr.create(
              {
                contact_fk: contactId,
                payload: JSON.stringify(visit),
              },
              {
                transaction,
              },
            );
          });
        }
      }

      // Update contact source
      await h.database.transaction(async (transaction) => {
        await contactSrcCtlr.update(
          clientId,
          { source_original_payload: JSON.stringify(contactInfo.Client) },
          {
            transaction,
          },
        );
      });
    } catch (err) {
      Sentry.captureException(err);
      console.log(err);
    }
  };

  ctlr.checkWebhooks = async () => {
    const log = [];
    const agentOauth = await agencyOauthCtlr.findAll({
      source: 'MINDBODY',
      status: 'active',
    });

    const agentSubs = agentOauth.map((m) => ({
      access_info: JSON.parse(m.access_info),
      webhook_info: JSON.parse(m.webhook_info),
    }));

    if (h.notEmpty(agentSubs)) {
      for (const subscription of agentSubs) {
        const mindbodyApi = new MindBodyAPI(
          subscription.access_info.siteId,
          subscription.access_info.apiKey,
        );

        const subscriptionRes = await mindbodyApi.getSubscription(
          subscription.webhook_info.subscriptionId,
        );

        // Set webhook to active if found not active
        if (
          h.notEmpty(subscriptionRes) &&
          subscriptionRes.status !== 'Active'
        ) {
          await mindbodyApi.activateMinBodyWebhook(
            subscription.webhook_info.subscriptionId,
          );
          log.push({
            subscriptionId: subscription.webhook_info.subscriptionId,
            change: subscriptionRes.status + ' to Active',
          });
        }
      }
    }

    return log;
  };

  async function messageContactAfter24HrsNoResponseFromInitialFormAutomation(
    rule,
    encryptionKeys,
  ) {
    console.log('💥💥💥💥💥💥💥START AUTOMATION LOG💥💥💥💥💥💥💥');
    console.log(
      '💥💥💥💥💥💥💥 Message contact after 24hrs if not responded 💥💥💥💥💥💥💥',
    );

    if (['immediately', 'week'].includes(rule.rule_trigger_setting)) {
      console.log(
        `💥💥💥💥💥💥💥 SKIP ${rule.rule_trigger_setting} rule💥💥💥💥💥💥💥`,
      );
      return;
    }

    const day_count = rule.rule_trigger_setting_count;
    const currentHour = moment().utc(true).format('H');

    // Set nowTime to current execution date and time
    const nowTime = moment()
      .utc(true)
      .startOf('day') // Set to the beginning of yesterday
      .set('hour', currentHour)
      .format('YYYY-MM-DD H:m:s');

    const startTime = moment()
      .utc(true)
      .subtract(parseInt(day_count), 'days')
      .startOf('day') // Set to the beginning of yesterday
      .set('hour', currentHour) // Set hour to current hour
      .format('YYYY-MM-DD H:m:s');

    const endTime = moment()
      .utc(true)
      .subtract(parseInt(day_count), 'days')
      .startOf('day') // Set to the beginning of yesterday
      .set('hour', currentHour) // Set hour to current hour
      .set('minute', 59) // Set minute to 59
      .set('second', 59) // Set second to 59
      .format('YYYY-MM-DD H:m:s');

    console.log({ startTime, endTime, nowTime });
    // return;
    const contacts = [];
    if (h.notEmpty(rule?.automation_rule_form)) {
      const submissions = await hubSpotFormSubmissionsCtlr.findAll(
        {
          hubspot_form_fk: rule?.automation_rule_form.dataValues.form_fk,
          created_date: {
            [Op.between]: [new Date(startTime), new Date(endTime)],
          },
          status: 'create',
        },
        {
          include: [
            {
              model: models.contact,
              required: true,
            },
          ],
        },
      );

      // console.log('subs', submissions);

      for (const sub of submissions) {
        // const actualSubmissionDate = moment(sub.created_date).format(
        //   'YYYY-MM-DD HH:mm',
        // );

        // const submissionDate = moment(sub.created_date)
        //   .startOf('hour')
        //   .format('YYYY-MM-DD HH:mm');

        // const submissionEndHour = moment(sub.created_date)
        //   .endOf('hour')
        //   .format('YYYY-MM-DD HH:mm');

        // const daysAfterSubmissionDate = moment(sub.created_date)
        //   .add(parseInt(rule.rule_trigger_setting_count), 'days')
        //   .format('YYYY-MM-DD HH:mm');
        // console.log('submissionStart', submissionDate);
        // console.log('actualSubmission', actualSubmissionDate);
        // console.log('submissionEnd', submissionEndHour);
        // console.log('dayAfterSubmission', daysAfterSubmissionDate);
        if (!contacts.includes(sub.contact_fk)) {
          const firstAutomationMessage =
            await whatsappMessageTrackerCtr.findOne(
              {
                contact_fk: sub.contact_fk,
                msg_origin: 'automation',
                campaign_name: {
                  [Op.like]: '%Automated Message%',
                },
              },
              {
                order: [['created_date', 'DESC']],
              },
            );
          // console.log(firstAutomationMessage);
          const hasFollowUpAutomation = await whatsappMessageTrackerCtr.findOne(
            {
              contact_fk: sub.contact_fk,
              msg_origin: 'automation',
              campaign_name: {
                [Op.like]: '%Automated Follow Up Message%',
              },
            },
            {
              order: [['created_date', 'DESC']],
            },
          );
          // console.log(hasFollowUpAutomation);

          if (
            h.notEmpty(firstAutomationMessage) &&
            h.cmpBool(firstAutomationMessage.replied, false) &&
            h.isEmpty(hasFollowUpAutomation) &&
            h.notEmpty(sub.contact.agency_user_fk) &&
            canEngage(sub.contact, 'automation')
          ) {
            contacts.push({
              contactId: sub.contact_fk,
              executionDateTime: nowTime,
            });
          }
        }
      }

      console.log(contacts);

      if (h.notEmpty(contacts)) {
        const agencyId = submissions[0].contact.agency_fk;
        const agency = agencyCtr.findOne({ agency_id: agencyId });
        const agencyRecord = agency.dataValues;
        const campaign_name = `Automated Follow Up Message ${agencyId} ${Date.now()}`;
        const tracker_ref_name = `${agencyId}_${Date.now()}_automation_${
          agencyRecord?.agency_name.replaceAll(' ', '_').toLowerCase() ||
          'agency'
        }`;

        const { agency_config_id, whatsapp_config } =
          await models.agency_config.findOne({
            where: { agency_fk: agencyId },
          });
        const wa_config = JSON.parse(whatsapp_config);
        console.log(wa_config);
        let saved_quick_replies = !h.isEmpty(wa_config.quick_replies)
          ? wa_config.quick_replies
          : [];
        const new_whatsapp_config = {
          is_enabled: wa_config.is_enabled,
          environment: wa_config.environment,
          quick_replies: saved_quick_replies,
        };

        // setup messaging config
        const cta = [];
        const automation_template = await automationRuleTemplateCtr.findOne({
          automation_rule_fk: rule.automation_rule_id,
        });

        const waba_template = await wabaTemplateCtr.findOne({
          waba_template_id: automation_template.template_fk,
        });

        // console.log(waba_template);
        const template = waba_template.dataValues;
        const selected_template = JSON.parse(template.content);
        const cta_option_type = [];
        for (let index = 0; index < 10; index++) {
          cta_option_type.push(
            automation_template[`cta_${index + 1}_option_type`],
          );
        }
        selected_template.components.forEach((component) => {
          if (h.cmpStr(component.type, 'BUTTONS')) {
            let qr_index = 0;
            component.buttons.forEach((btn, index) => {
              if (h.cmpStr(btn.type, 'QUICK_REPLY')) {
                cta.push(btn.text);
                saved_quick_replies = h.whatsapp.checkIfQRIsCheckedAnMonitored(
                  cta_option_type[qr_index],
                  btn.text,
                  saved_quick_replies,
                );
                qr_index++;
              }
            });
          }
        });

        if (!h.isEmpty(cta)) {
          console.log(cta);
          new_whatsapp_config.quick_replies = saved_quick_replies;
          await agencyConfigCtl.update(agency_config_id, {
            whatsapp_config: JSON.stringify(new_whatsapp_config),
          });
          const campaignCtaData = {
            campaign_tracker_ref_name: tracker_ref_name,
            campaign_notification_additional_recipients: null,
            is_confirmation: false,
          };
          for (let index = 0; index < 10; index++) {
            campaignCtaData[`cta_${index + 1}`] = !h.isEmpty(cta[index])
              ? cta[index]
              : null;
            campaignCtaData[`cta_${index + 1}_response`] =
              automation_template[`cta_${index + 1}_response`];
            campaignCtaData[`trigger_cta_${index + 1}_options`] =
              automation_template[`trigger_cta_${index + 1}_options`];
            campaignCtaData[`cta_${index + 1}_final_response`] =
              automation_template[`cta_${index + 1}_final_response`];
            campaignCtaData[`cta_${index + 1}_option_type`] =
              automation_template[`cta_${index + 1}_option_type`];
          }
          await campaignCtaCtl.create(campaignCtaData);
        }
        for (const contact of contacts) {
          console.log({
            contact_id: contact.contactId,
            rule_id: rule.automation_rule_id,
            executionDateTime: contact.executionDateTime,
          });

          // const agencyId = contact.agency_fk;
          // const agency = agencyCtr.findOne({ agency_id: agencyId });
          // const agencyRecord = agency.dataValues;
          // const campaign_name = `Automated Message ${agencyId} ${Date.now()}`;
          // const tracker_ref_name = `${agencyId}_${Date.now()}_automation_${
          //   agencyRecord?.agency_name.replaceAll(' ', '_').toLowerCase() ||
          //   'agency'
          // }`;

          await sendWhatsAppMessage(
            contact.contactId,
            rule.automation_rule_id,
            campaign_name,
            tracker_ref_name,
            contact.executionDateTime,
            encryptionKeys,
          );
        }
      }
    }

    console.log(rule);
  }

  ctlr.runHubSpotAutomationResponseCheck = async (encryptionKeys) => {
    /** Get all active rules */
    const rules = await automationRuleCtlr.findAll(
      {
        status: 'active',
        // automation_rule_id: 'ea57689f-b3c1-42de-9812-6eec881373fa',
      },
      {
        include: [
          {
            model: models.automation_rule_template,
          },
          {
            model: models.automation_rule_packages,
            include: [
              {
                model: models.mindbody_packages,
              },
            ],
          },
          {
            model: models.automation_rule_form,
            include: [
              {
                model: models.hubspot_form,
              },
            ],
          },
          {
            model: models.automation_category,
          },
        ],
      },
    );

    if (h.notEmpty(rules)) {
      for (const rule of rules) {
        switch (rule.rule_trigger_fk) {
          /**
           * HUBSPOT AUTOMATION
           */
          case 'da7875aa-7e42-4260-8941-02ba9b90e0f0': {
            await messageContactAfter24HrsNoResponseFromInitialFormAutomation(
              rule,
              encryptionKeys,
            );
            break;
          }
        }
      }
    }

    // return rules;
  };

  return ctlr;
};
