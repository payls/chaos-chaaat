const c = require('../../controllers');
const h = require('../../helpers');
const jsforce = require('jsforce');
const constant = require('../../constants/constant.json');
const SOURCE_TYPE = constant.TRAY.USER_SOLUTION_SOURCE_TYPE.SALESFORCE;
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const { Op } = require('sequelize');
const axios = require('axios');

async function _sendToOutlookOrGmail({
  agency_user_id,
  receiverEmail,
  senderEmail,
  senderName,
  receiverName,
  subject,
  body,
  log,
  process_id,
  models,
}) {
  try {
    // find integration
    // if integration found send
    // return status
    let outlookIntegration = await models.agency_user_tray_solution.findOne({
      where: {
        tray_user_solution_source_type: 'OUTLOOK',
        tray_user_solution_instance_status: 'active',
      },
      include: [
        {
          model: models.agency_user_tray,
          where: {
            is_deleted: false,
            agency_user_fk: agency_user_id,
          },
          require: true,
        },
      ],
    });

    outlookIntegration =
      outlookIntegration && outlookIntegration.toJSON
        ? outlookIntegration.toJSON()
        : outlookIntegration;

    log.info({
      process_id,
      processor: 'sf-create-contact-opportunity',
      func: '_sendToOutlookOrGmail',
      outlookIntegration,
    });

    if (
      outlookIntegration &&
      outlookIntegration.tray_user_solution_instance_webhook_trigger
    ) {
      const webhook = JSON.parse(
        outlookIntegration.tray_user_solution_instance_webhook_trigger,
      );
      const send_email = webhook?.send_email;

      let status = false;
      if (send_email) {
        log.info({
          process_id,
          message: 'Sending email tru OUTLOOK',
          processor: 'sf-create-contact-opportunity',
          func: '_sendToOutlookOrGmail',
        });
        const payload = {
          to: receiverEmail,
          sender_name: senderName,
          bcc_email: '',
          mail_subject: subject,
          mail_body: body.replace(/[\r\n]/gm, ''),
        };

        const axiosConfig = {
          method: 'post',
          url: send_email,
          data: payload,
        };

        const response = await axios(axiosConfig);

        status = response?.status === 200;
      }
      if (status) return status;
    }

    let gmailIntegration = await models.agency_user_tray_solution.findOne({
      where: {
        tray_user_solution_source_type: 'GMAIL',
        tray_user_solution_instance_status: 'active',
      },
      include: [
        {
          model: models.agency_user_tray,
          where: {
            is_deleted: false,
            agency_user_fk: agency_user_id,
          },
          required: true,
        },
      ],
    });

    gmailIntegration =
      gmailIntegration && gmailIntegration.toJSON
        ? gmailIntegration.toJSON()
        : gmailIntegration;

    log.info({
      process_id,
      processor: 'sf-create-contact-opportunity',
      func: '_sendToOutlookOrGmail',
      gmailIntegration,
    });

    if (
      gmailIntegration &&
      gmailIntegration.tray_user_solution_instance_webhook_trigger
    ) {
      let status = false;
      const webhook = JSON.parse(
        gmailIntegration.tray_user_solution_instance_webhook_trigger,
      );
      const send_email = webhook?.send_email;

      if (send_email) {
        const payload = {
          gmail_id: senderEmail,
          to: receiverEmail,
          from: senderEmail,
          cc_email: [], // CC currently not being used
          cc_name: '', // CC currently not being used
          bcc_email: '',
          bcc_name: '', // BCC name currently not being used
          sender_name: senderName,
          receiver_name: receiverName,
          mail_subject: subject,
          mail_body: body.replace(/[\r\n]/gm, ''),
        };

        log.info({
          process_id,
          message: 'Sending email tru GMAIL',
          processor: 'sf-create-contact-opportunity',
          func: '_sendToOutlookOrGmail',
        });

        const axiosConfig = {
          method: 'post',
          url: send_email,
          data: payload,
        };

        const response = await axios(axiosConfig);

        status = response?.status === 200;
      }
      if (status) return status;
    }

    // not sent anything
    return false;
  } catch (err) {
    log.warn({
      process_id,
      err,
      processor: 'sf-create-contact-opportunity',
      func: '_sendToOutlookOrGmail',
    });
    // ignore error
    return false;
  }
}

async function _upsertOpportunity({
  agency_id,
  OpportunityId,
  opportunity,
  transaction,
  salesforce_config,
}) {
  const duplicateOp = await c.sfOpportunity.findOne(
    {
      agency_fk: agency_id,
      Id: OpportunityId,
    },
    { transaction },
  );

  const project_id_field =
    salesforce_config?.project_id_field || 'Project_ID__c';

  if (!duplicateOp) {
    await c.sfOpportunity.create(
      {
        ...opportunity,
        Project_ID__c: opportunity[project_id_field],
        agency_fk: agency_id,
        attributes: JSON.stringify(opportunity.attributes),
      },
      { transaction },
    );
  } else {
    await c.sfOpportunity.update(
      duplicateOp.sf_opportunity_id,
      {
        ...opportunity,
        Project_ID__c: opportunity[project_id_field],
        attributes: JSON.stringify(opportunity.attributes),
      },
      null,
      { transaction },
    );
  }
}

async function _upsertContact({ models, salesforce_contact, transaction }) {
  const {
    contact: { Email, FirstName, LastName, MobilePhone, Id: source_contact_id },
    contact_owner: { Email: ContactOwnerEmail },
    agency_user: { agency_fk: agency_id },
  } = salesforce_contact;

  let agency_user_fk;
  let user_id;
  let hasPaveOwner = await c.user.findOne({ email: ContactOwnerEmail });

  if (hasPaveOwner) {
    hasPaveOwner = hasPaveOwner.toJSON();
    const agencyUser = await c.agencyUser.findOne({
      agency_fk: agency_id,
      user_fk: hasPaveOwner.user_id,
    });

    agency_user_fk = agencyUser?.agency_user_id;
    user_id = hasPaveOwner.user_id;
  }

  const contactQ = {
    email: Email,
    first_name: FirstName,
    last_name: LastName,
    mobile_number: MobilePhone,
    status: constant.CONTACT.STATUS.ACTIVE,
    agency_fk: agency_id,
  };

  if (agency_user_fk) contactQ.agency_user_fk = agency_user_fk;

  const duplicateContact = await c.contact.findOne(contactQ, {
    include: [
      {
        model: models.contact_source,
        required: true,
        where: { source_contact_id: source_contact_id },
      },
    ],
  });

  if (!duplicateContact) {
    const contact_id = await c.contact.create(
      {
        email: Email,
        first_name: FirstName,
        last_name: LastName,
        mobile_number: MobilePhone,
        status: constant.CONTACT.STATUS.ACTIVE,
        agency_user_fk: agency_user_fk,
        agency_fk: agency_id,
      },
      { transaction },
    );

    await c.contactSource.create({
      contact_fk: contact_id,
      created_by: agency_user_fk,
      source_type: SOURCE_TYPE,
      source_contact_id: source_contact_id,
    });

    return { contact_id, user_id };
  }

  return { contact_id: duplicateContact.contact_id, user_id };
}

async function _createProposalAndSendEmailOne({
  projectId,
  contactId,
  log,
  models,
  config,
  agencyConfig: agency_config,
  sfOwnerId,
  agency_id,
  process_id,
}) {
  log.info({
    process_id,
    funcName: '_createProposalAndSendEmailOne',
    params: {
      projectId,
      contactId,
      config,
      agencyConfig: agency_config,
      sfOwnerId,
      agency_id,
    },
  });
  const ContactService = require('../../services/staff/contact');
  const contactService = new ContactService();
  // create proposal based on projectId

  // check for duplicates
  const oneHourAgo = moment().subtract(1, 'hour').toDate();
  const now = moment().toDate();
  const shortlistedProject = await c.shortlistedProject.findOne({
    contact_fk: contactId,
    is_deleted: 0,
    created_date: {
      [Op.between]: [oneHourAgo, now],
    },
  });

  if (shortlistedProject) {
    log.warn({
      process_id,
      message: `Aborting sending Email Project Duplicate proposal`,
      processor: 'sf-create-contact-opportunity',
      projectId,
      contactId,
    });
    return null;
  }
  //

  let project = await c.project.findOne({
    sf_project_id: projectId,
    agency_fk: agency_id,
  });

  if (!project) {
    log.warn({
      process_id,
      message: `Aborting sending Email Project ${projectId} not found`,
      processor: 'sf-create-contact-opportunity',
      projectId,
      contactId,
    });
    return null;
  } else {
    project = project && project.toJSON ? project.toJSON() : project;
  }

  const contactRecord = await c.contact.findOne({ contact_id: contactId });

  if (!contactRecord || !contactRecord.agency_user_fk) {
    log.warn({
      process_id,
      message: `Aborting sending Email Contact or Contact owner for contact ID ${contactId} not found`,
      processor: 'sf-create-contact-opportunity',
      projectId,
      contactId,
    });
    return null;
  }

  const agencyUser = await models.agency_user.findOne({
    where: {
      agency_user_id: contactRecord.agency_user_fk,
    },
    include: [
      { model: models.agency, required: true },
      { model: models.user, required: true },
    ],
  });

  if (!agencyUser) {
    log.warn({
      process_id,
      message: `Aborting sending Email Contact or Contact owner for contact ID ${contactId} not found`,
      processor: 'sf-create-contact-opportunity',
      projectId,
      contactId,
    });
    return null;
  }

  const {
    // agency_fk,
    title: agentTitle,
    agency: { agency_name, agency_subdomain, agency_website },
    user: { first_name, last_name, email, mobile_number },
  } = agencyUser;

  const transaction = await models.sequelize.transaction();

  try {
    // create permalink
    let permalink = contactRecord.permalink;
    if (h.isEmpty(contactRecord.permalink)) {
      permalink = await contactService.checkIfPermalinkIsUnique(
        h.general.generateRandomAlpanumeric(5),
      );
    }
    const lead_status = constant.LEAD_STATUS.UPDATED_PROPOSAL_CREATED;
    const permalinkSentDate = null;
    const is_general_enquiry = false;
    const enquiry_email_timestamp = new Date();

    // soft delete previous contact shortlisted projects
    await c.shortlistedProject.softDestroyAll(
      {
        contact_fk: contactId,
      },
      { transaction },
    );

    // delete previous shortlisted properties
    await c.shortListedProperty.softDestroyAll(
      {
        contact_fk: contactId,
      },
      { transaction },
    );

    // create shortlisted project
    await c.shortlistedProject.create(
      {
        contact_fk: contactId,
        project_fk: project.project_id,
        display_order: 0,
      },
      { transaction },
    );

    await c.contact.update(
      contactId,
      {
        permalink,
        updated_by: agencyUser.user_fk,
        permalink_sent_date: h.general.notEmpty(permalinkSentDate)
          ? permalinkSentDate
          : undefined,
        lead_status: lead_status,
        lead_score: 0,
        last_24_hour_lead_score: 0,
        last_48_hour_lead_score: 0,
        last_24_hour_lead_score_diff: 0,
        is_general_enquiry: is_general_enquiry,

        enquiry_email_timestamp,
      },
      { transaction },
    );
    // create link
    const sendPermalink = h.route.createPermalink(
      agency_subdomain,
      config.webUrl,
      agency_name,
      contactRecord,
      permalink,
    );

    // send email
    // send permalink to email
    const buyerFirstName = h.user.capitalizeFirstLetter(
      contactRecord.first_name,
    );
    const buyerEmail = contactRecord.email;
    const agentFullName = h.general.combineFirstLastName(
      h.user.capitalizeFirstLetter(first_name),
      h.user.capitalizeFirstLetter(last_name),
      ' ',
    );
    const { facebook, instagram, linkedin, youtube } = agencyUser;
    // send email
    /* Media link sample
    <ul style="list-style-type: none; padding: 0px;">
      <li style="display: inline-block; border-right-width: 1px; border-right-color: rgb(0, 0, 0); border-right-style: solid; padding: 0px 10px;"><a href="" style="color: #0d6efd;">Facebook</a></li>
      <li style="display: inline-block; border-right-width: 1px; border-right-color: rgb(0, 0, 0); border-right-style: solid; padding: 0px 10px;"><a href="" style="color: #0d6efd;">Instagram</a></li>
      <li style="display: inline-block; border-right-width: 1px; border-right-color: rgb(0, 0, 0); border-right-style: solid; padding: 0px 10px;"><a href="" style="color: #0d6efd;">Linkedin</a></li>
      <li style="display: inline-block; padding: 0px 10px;"><a href="" style="color: #0d6efd;">YouTube</a></li>
    </ul>
    */
    let mediaLink = '<ul style="list-style-type: none; padding: 0px;">';
    if (facebook) {
      mediaLink += `<li style="display: inline-block; border-right-width: 1px; border-right-color: rgb(0, 0, 0); border-right-style: solid; padding: 0px 10px;"><a style="text-decoration: underline; color: #000000;" class="text-black" href="${facebook}" style="color: #0d6efd;">Facebook</a></li>`;
    }

    if (instagram) {
      mediaLink += `<li style="display: inline-block; border-right-width: 1px; border-right-color: rgb(0, 0, 0); border-right-style: solid; padding: 0px 10px;"><a style="text-decoration: underline; color: #000000;" class="text-black" href="${instagram}" style="color: #0d6efd;">Instagram</a></li>`;
    }

    if (linkedin) {
      mediaLink += `<li style="display: inline-block; border-right-width: 1px; border-right-color: rgb(0, 0, 0); border-right-style: solid; padding: 0px 10px;"><a style="text-decoration: underline; color: #000000;" class="text-black" href="${linkedin}" style="color: #0d6efd;">Linkedin</a></li>`;
    }

    if (youtube) {
      mediaLink += `<li style="display: inline-block; padding: 0px 10px;"><a style="text-decoration: underline; color: #000000;" class="text-black" href="${youtube}" style="color: #0d6efd;">YouTube</a></li>`;
    }

    mediaLink += '</ul>';

    let salesforceConfig = agency_config?.salesforce_config;
    try {
      salesforceConfig = JSON.parse(salesforceConfig);
    } catch (err) {}
    if (!salesforceConfig) {
      log.warn({
        process_id,
        message: `Aborting sending Email Template not found`,
        processor: 'sf-create-contact-opportunity',
        projectId,
        contactId,
      });
      await transaction.rollback();
      return null;
    }
    const { project_email_templates = [], owners = {} } = salesforceConfig;

    const ownerInfo = owners[sfOwnerId];

    if (!ownerInfo) {
      log.warn({
        process_id,
        message: `Aborting sending Email Owner Info for ${sfOwnerId} not found`,
        processor: 'sf-create-contact-opportunity',
        projectId,
        contactId,
        sfOwnerId,
      });
      await transaction.rollback();
      return null;
    }

    const template = project_email_templates.reduce((pv, cv) => {
      if (pv) return pv;
      if (cv.project_id === projectId && cv.email_type === '1') return cv;
      return null;
    }, null);

    if (!template) {
      log.warn({
        process_id,
        message: `Aborting sending Email Template not found`,
        processor: 'sf-create-contact-opportunity',
        projectId,
        contactId,
      });
      await transaction.rollback();
      return null;
    }

    const subjectName = template.subject;
    const bodyName = template.body;
    const proposalLinkName = `${h.user.capitalizeFirstLetter(
      project?.name || '',
    )} project information`;

    const subject = h.getMessageByCode(subjectName);
    const body = h.getMessageByCode(bodyName, {
      FIRST_NAME: buyerFirstName,
      AGENT_FULLNAME: agentFullName,
      MEDIA_LINKS: mediaLink,
      PROPOSAL_LINK: sendPermalink,
      PROPOSAL_LINK_NAME: proposalLinkName,
      AGENCY_WEBSITE: agency_website,
      AGENT_TITLE: agentTitle && agentTitle.toUpperCase(),
      AGENT_FULLNAME_CAPS: agentFullName.toUpperCase(),
      AGENT_MOBILE: mobile_number,
      AGENCY_NUMBER: '+61 3 9644 2600',
      PROJECT_CONTACT_PERSON_CALENDLY:
        (ownerInfo && ownerInfo.calendly && ownerInfo.calendly[projectId]) ||
        '',
      PROJECT_CONTACT_PERSON: h.user.capitalizeFirstLetter(
        (ownerInfo && ownerInfo.first_name) || first_name,
      ),
    });

    // need to update to send to either gmail or outlook
    const sentToOutlookOrGmail = await _sendToOutlookOrGmail({
      agency_user_id: agencyUser?.agency_user_id,
      receiverEmail: buyerEmail,
      senderName: agentFullName,
      senderEmail: email,
      receiverName: buyerFirstName,
      subject,
      body,
      log,
      process_id,
      models,
    });

    if (!sentToOutlookOrGmail) {
      await h.email.sendHtmlEmail(
        `${agentFullName} <${email}>`,
        buyerEmail, // To buyer email
        subject,
        body,
      );
    }

    await c.contact.update(
      contactId,
      {
        lead_status: constant.LEAD_STATUS.UPDATED_PROPOSAL_SENT,
        updated_date: h.date.getSqlCurrentDate(),
      },
      { transaction },
    );
    await transaction.commit();
  } catch (err) {
    log.error({
      process_id,
      err,
      processor: 'sf-create-contact-opportunity',
      func: '_createProposalAndSendEmailOne',
    });
    await transaction.rollback();
    throw new Error('failed to send Enquiry email to contact');
  }
}

async function _upsertContactOpportunity({ contact_opportunity, transaction }) {
  const duplicateContactOp = await c.sfContactOpportunity.findOne({
    agency_fk: contact_opportunity.agency_fk,
    Id: contact_opportunity.Id,
  });

  if (!duplicateContactOp) {
    await c.sfContactOpportunity.create(contact_opportunity, { transaction });
  }
}

async function _addToContatPropertyValues({
  salesforce_config,
  contact_id,
  user_id,
  transaction,
  opportunity,
  agency_id,
}) {
  const project_id_field =
    salesforce_config?.project_property_field || 'Project_name__c';
  let contactPropertyDefinition = await c.contactPropertyDefinitions.findOne({
    agency_fk: agency_id,
    attribute_source: 'SALESFORCE',
    attribute_source_field: project_id_field,
  });

  if (!contactPropertyDefinition) return null;
  contactPropertyDefinition = contactPropertyDefinition?.toJSON
    ? contactPropertyDefinition.toJSON()
    : contactPropertyDefinition;

  await c.contactPropertyValues.create(
    {
      contact_fk: contact_id,
      contact_property_definition_fk:
        contactPropertyDefinition.contact_property_definition_id,
      attribute_value_string: opportunity[project_id_field],
      created_by: user_id,
    },
    { transaction },
  );
}

module.exports = async ({ data, models, channel, config, pubChannel, log }) => {
  const { data: contactOpportunityInfo } = JSON.parse(data.content.toString());
  const { agency_id, body } = contactOpportunityInfo;
  const process_id = uuidv4();

  log.info({
    process_id,
    data: contactOpportunityInfo,
    processor: 'sf-create-contact-opportunity',
  });

  const transaction = await models.sequelize.transaction();

  try {
    // const agency = await models.agency.findOne({
    //   where: { agency_id },
    //   include: [
    //     {
    //       model: models.agency_oauth,
    //       where: {
    //         status: 'active',
    //         source: 'SALESFORCE',
    //       },
    //       required: true,
    //     },
    //   ],
    // });

    const agency = await c.agency.findOne(
      {
        agency_id,
      },
      {
        include: [
          {
            model: models.agency_oauth,
            where: {
              status: 'active',
              source: 'SALESFORCE',
            },
            require: true,
          },
        ],
        transaction,
      },
    );

    const agencyOauth = agency.dataValues.agency_oauth;

    const { access_token, refresh_token, instance_url } = JSON.parse(
      agencyOauth.access_info,
    );

    const oauthParams = {
      clientId: config.directIntegrations.salesforce.clientId,
      clientSecret: config.directIntegrations.salesforce.clientSecret,
      redirectUri: config.directIntegrations.salesforce.redirectUri,
    };

    if (instance_url.includes('sandbox')) {
      oauthParams.loginUrl = 'https://test.salesforce.com';
    }

    const oauth2 = new jsforce.OAuth2(oauthParams);

    const connParams = {
      oauth2,
      instanceUrl: instance_url,
      accessToken: access_token,
      refreshToken: refresh_token,
    };

    if (instance_url.includes('sandbox')) {
      connParams.loginUrl = 'https://test.salesforce.com';
    }

    const conn = new jsforce.Connection(connParams);

    await new Promise((resolve, reject) => {
      conn.oauth2.refreshToken(refresh_token, async (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    const { OpportunityId, ContactId } = body.New;

    const opportunity = await new Promise((resolve, reject) => {
      conn.sobject('Opportunity').retrieve(OpportunityId, (err, ops) => {
        if (err) return reject(err);
        resolve(ops);
      });
    });

    const contact = await new Promise((resolve, reject) => {
      conn.sobject('Contact').retrieve(ContactId, (err, ops) => {
        if (err) return reject(err);
        resolve(ops);
      });
    });

    const owner = await new Promise((resolve, reject) => {
      conn.sobject('User').retrieve(contact.OwnerId, function (err, account) {
        if (err) {
          return reject(err);
        }
        resolve(account);
      });
    });

    // validate values:
    if (
      h.isEmpty(contact.Id) ||
      h.isEmpty(opportunity.Id) ||
      h.isEmpty(body.New?.Id)
    ) {
      log.warn({
        process_id,
        processor: 'sf-create-contact-opportunity',
        contact,
        opportunity,
        body,
      });

      throw new Error('Missing Parameters.');
    }

    // check if contact should be added based on product ID and agency config
    let agency_config = await c.agencyConfig.findOne({
      agency_fk: agency_id,
    });

    let toAddContact = true;
    let toAddInCustomProperty = false;
    agency_config =
      agency_config && agency_config.toJSON
        ? agency_config.toJSON()
        : agency_config;

    let { salesforce_config } = agency_config;
    let sfProjectId;
    if (agency_config) {
      try {
        salesforce_config = JSON.parse(salesforce_config);
      } catch (error) {}

      const project_id_field =
        salesforce_config?.project_id_field || 'Project_ID__c';

      toAddContact = h.salesforce.addContactBasedOnProductId({
        projectId: opportunity && opportunity[project_id_field],
        agencyConfig: agency_config,
      });

      toAddInCustomProperty = toAddContact;
      sfProjectId = opportunity && opportunity[project_id_field];
    }

    if (!toAddContact) {
      log.warn({
        process_id,
        processor: 'sf-create-contact-opportunity',
        message: 'Aborting adding contact',
        toAddContact,
        salesforce_config,
        opportunity,
        contact,
        owner,
        sfProjectId,
      });

      await transaction.rollback();

      if (channel && channel.ack) {
        log.info('Channel for acknowledgment');
        return await channel.ack(data);
      } else {
        log.error('Channel not available for acknowledgment');
        throw new Error('AMQ channel not available');
      }
    }
    // find opportunity create or update
    await _upsertOpportunity({
      models,
      agency_id,
      OpportunityId,
      opportunity,
      transaction,
      salesforce_config,
      process_id,
    });

    // create or update contact
    const salesforce_contact = {
      contact,
      contact_owner: {
        Email: owner?.Email || '',
      },
      agency_user: {
        agency_fk: agency_id,
      },
    };

    const { contact_id, user_id } = await _upsertContact({
      models,
      salesforce_contact,
      transaction,
    });

    // find contactOpportunity create or update
    const contact_opportunity = {
      ...body.New,
      attributes: JSON.stringify(body.New?.attributes),
      agency_fk: agency_id,
    };

    await _upsertContactOpportunity({
      models,
      contact_opportunity,
      transaction,
      process_id,
    });

    // add to contact_property_values
    if (toAddInCustomProperty) {
      await _addToContatPropertyValues({
        salesforce_config,
        contact_id,
        user_id,
        transaction,
        opportunity,
        agency_id,
        process_id,
      });
    }

    await transaction.commit();

    const project_id_field =
      salesforce_config?.project_id_field || 'Project_ID__c';

    const ownerIdField = salesforce_config?.owner_id_field || 'OwnerId';

    // send Email 1
    if (
      salesforce_config?.send_email_after_enquiry &&
      opportunity[project_id_field]
    ) {
      console.log('\n\n\nSENDING EMAIL ONE');
      if (process.env.ENABLE_SENDING_EMAIL_ONE === 'true') {
        await _createProposalAndSendEmailOne({
          projectId: opportunity[project_id_field],
          contactId: contact_id,
          log,
          models,
          config,
          agencyConfig: agency_config,
          sfOwnerId: opportunity[ownerIdField] || opportunity.OwnerId,
          agency_id,
          process_id,
        });
      } else {
        log.info({
          process_id,
          processor: 'sf-create-contact',
          message: 'EMAIl ONE sending disabled.',
        });
      }
    }

    // if (h.notEmpty(contact_id)) {
    //   await c.contact.sendContactAssignmentNotificationEmail(contact_id);
    // }
    log.info({
      process_id,
      success: true,
      processor: 'sf-create-contact',
    });
    if (channel && channel.ack) {
      log.info('Channel for acknowledgment');
      return await channel.ack(data);
    } else {
      log.error('Channel not available for acknowledgment');
      throw new Error('AMQ channel not available');
    }
  } catch (err) {
    log.error({
      process_id,
      err,
      processor: 'sf-create-contact-opportunity',
    });
    try {
      // transaction might be commited at this point
      await transaction.rollback();
    } catch (e) {
      // ignore error
    }
    await channel.nack(data, false, false);
  }
};
