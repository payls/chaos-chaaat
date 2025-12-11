const h = require('../helpers');
const config = require('../configs/config')(process.env.NODE_ENV);
const constant = require('../constants/constant.json');
const api = require('../api');
const { sendTrayOutlookEmail } = require('../services/tray/outlook');
const { sendTrayGmailEmail } = require('../services/tray/gmail');

module.exports.makeShortlistedPropertyCommentEmailController = (models) => {
  const userController = require('./user').makeUserController(models);
  const agencyUserController =
    require('./agencyUser').makeAgencyUserController(models);
  const agencyController = require('./agency').makeAgencyController(models);
  const contactController = require('./contact').makeContactController(models);
  const shortListedPropertyController =
    require('./shortlistedProperty').makeShortListedPropertyController(models);
  const projectPropertyController =
    require('./projectProperty').makeProjectPropertyController(models);
  const projectController = require('./project').makeProjectController(models);
  const contactEmailCommunicationController =
    require('./contactEmailCommunication').makeContactEmailCommunicationController(
      models,
    );
  const trayIntegrationsController =
    require('./trayIntegrations').makeTrayIntegrationsController(models);

  const shortlistedPropertyCommentEmailController = {};

  /**
   * Construct email to send to buyer contact upon comment creation
   * @param request?: fastify request object
   * @param user_id?: string
   * @param contact_id?: string
   // * @param unit?: object
   * @param message?: object
   * @param shortlisted_property_id?: string
   * @param shortlistedPropertyCommentId?: string
   * @param {{ send_email?: boolean ,transaction?:object }} [options]
   * @returns {Promise<{default_email_subject: string, default_email_body: string}>} if send_email is false
   */
  shortlistedPropertyCommentEmailController.constructCommentEmailToBuyer =
    async (
      request,
      user_id,
      contact_id,
      // unit,
      message,
      shortlisted_property_id,
      shortlistedPropertyCommentId,
      { send_email = true, transaction } = {},
    ) => {
      const funcName =
        'shortlistedPropertyCommentEmail.constructCommentEmailToBuyer';
      h.validation.requiredParams(funcName, {
        user_id,
        contact_id,
        // unit,
        message,
        shortlisted_property_id,
        shortlistedPropertyCommentId,
      });

      // Retrieve agency user details
      const { email, first_name, hubspot_bcc_id } =
        await userController.findOne({ user_id }, { transaction });
      const { agency_fk, agency_user_id } = await agencyUserController.findOne(
        { user_fk: user_id },
        { transaction },
      );
      // Retrieve agency detail
      const { agency_name, agency_subdomain } = await agencyController.findOne(
        { agency_id: agency_fk },
        { transaction },
      );
      // Buyer details
      const contactRecord = await contactController.findOne(
        { contact_id },
        { transaction },
      );
      const {
        first_name: buyerFirstName,
        email: buyerEmail,
        permalink: buyerPermalink,
      } = contactRecord;

      // Property details
      const shortListedProperty = await shortListedPropertyController.findOne({
        shortlisted_property_id,
      });
      const { project_property_fk } = shortListedProperty;
      const unit = await projectPropertyController.findOne({
        project_property_id: project_property_fk,
      });
      const project = await projectController.findOne({
        project_id: unit.project_fk,
      });
      const projectName = project.name || '';
      const { floor, sqm, direction_facing } = unit;
      const fullPropertyName = `${projectName} | ${floor} floor | ${sqm} sqm | ${direction_facing} facing`;
      // Permalink to buyer page
      const commentLink = h.route.createPermalink(
        agency_subdomain,
        config.webUrl,
        agency_name,
        contactRecord,
        buyerPermalink,
      );

      // assigning email subject and body
      const default_email_subject = h.getMessageByCode(
        'template-commentPosted-subject-1624117268',
      );
      const default_email_body = h.getMessageByCode(
        'template-commentPosted-body-1624117278',
        {
          BUYER_FIRST_NAME: buyerFirstName,
          AGENT_FIRST_NAME: first_name,
          AGENCY_NAME: agency_name,
          PROPERTY_NAME: fullPropertyName,
          MESSAGE: message,
          COMMENT_LINK: commentLink,
        },
      );

      if (send_email) {
        const apiRes = await api.integrations.getAgencyUserActiveIntegrations(
          request,
          {
            agency_user_id,
            agency_fk,
          },
        );

        const activeIntegrations =
          apiRes.status === 'ok' ? apiRes.data.active_integrations : '';

        let emailSent = false;

        // try sending via gmail
        if (
          h.notEmpty(activeIntegrations) &&
          activeIntegrations.gmail ===
            constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE
        ) {
          try {
            const gmail_webhook = await trayIntegrationsController.getWebhook(
              agency_user_id,
              constant.TRAY.USER_SOLUTION_SOURCE_TYPE.GMAIL,
            );
            if (h.notEmpty(gmail_webhook)) {
              emailSent = await sendTrayGmailEmail(
                gmail_webhook,
                email,
                buyerEmail,
                buyerFirstName,
                email,
                first_name,
                default_email_subject,
                default_email_body,
                hubspot_bcc_id,
              );
            }
          } catch (error) {
            console.log(`${funcName}: ${error}`);
          }
        }

        // if emailSent is false that implies gmail wasn't active or failed.
        // try sending via outlook
        if (
          h.notEmpty(activeIntegrations) &&
          !emailSent &&
          activeIntegrations.outlook ===
            constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE
        ) {
          try {
            const outlook_webhook = await trayIntegrationsController.getWebhook(
              agency_user_id,
              constant.TRAY.USER_SOLUTION_SOURCE_TYPE.OUTLOOK,
            );
            if (h.notEmpty(outlook_webhook)) {
              emailSent = await sendTrayOutlookEmail(
                outlook_webhook,
                buyerEmail,
                first_name,
                default_email_subject,
                default_email_body,
                hubspot_bcc_id,
              );
            }
          } catch (error) {
            console.log(`${funcName}: ${error}`);
          }
        }

        // if emailSent is false that implies outlook and gmail emails didn't go through
        if (!emailSent) {
          // send email default
          await h.email.sendEmail(
            `Chaaat <no-reply@chaaat.io>`,
            buyerEmail, // To buyer email
            null,
            default_email_subject,
            default_email_body,
          );
        }
      } else {
        // send the message back when the send_email boolean is false
        return { default_email_subject, default_email_body };
      }
    };

  /**
   * Construct email to send to agency user upon comment creation
   * @param contact_id?: string
   * @param message?: object
   * @param shortlisted_property_id?: string
   * @param shortlistedPropertyCommentId?: string
   * @param {{ send_email?: boolean, transaction?:object }} [options]
   * @returns {Promise<{default_email_subject: string, default_email_body: string}>} if send_email is false
   */
  shortlistedPropertyCommentEmailController.constructCommentEmailToAgent =
    async (
      contact_id,
      message,
      shortlisted_property_id,
      shortlistedPropertyCommentId,
      { send_email = true, transaction } = {},
    ) => {
      const funcName =
        'shortlistedPropertyCommentEmail.constructCommentEmailToAgent';
      h.validation.requiredParams(funcName, {
        contact_id,
        message,
        shortlisted_property_id,
        shortlistedPropertyCommentId,
      });
      // Retrieve contact details
      const contactRecord = await contactController.findOne(
        { contact_id },
        { transaction },
      );
      // Retrieve agency user details
      const { user_fk } = await agencyUserController.findOne(
        { agency_user_id: contactRecord.agency_user_fk },
        { transaction },
      );
      const { email, first_name } = await userController.findOne(
        { user_id: user_fk },
        { transaction },
      );
      // Retrieve property details
      const shortlistedProperty = await shortListedPropertyController.findOne({
        shortlisted_property_id,
      });
      // project_property_fk = local database property ID
      // property_fk = WordPress Content site's unit ID
      const { project_property_fk: property_fk } = shortlistedProperty;
      const unit = await projectPropertyController.findOne({
        project_property_id: property_fk,
      });
      const project = await projectController.findOne({
        project_id: unit.project_fk,
      });
      const projectName = project.name || '';
      const unit_number = h.notEmpty(unit.unit_number)
        ? `#${unit.unit_number} |`
        : '';
      const number_of_bedroom = h.notEmpty(unit.number_of_bedroom)
        ? `${unit.number_of_bedroom} bedroom${
            unit.number_of_bedroom > 1 ? 's' : ''
          } |`
        : '';
      const number_of_bathroom = h.notEmpty(unit.number_of_bathroom)
        ? `${unit.number_of_bathroom} bathroom${
            unit.number_of_bathroom > 1 ? 's' : ''
          } |`
        : '';

      const unit_starting_price = h.notEmpty(unit.starting_price)
        ? `${project.currency_code} ${h.currency.format(
            unit.starting_price,
            0,
          )}`
        : '';
      const fullPropertyName = `${projectName} | ${unit_number} ${number_of_bedroom} ${number_of_bathroom} ${unit_starting_price}`;
      // Link to admin dashboard comment
      const commentLink = `${config.webAdminUrl}/dashboard/comments/${shortlistedPropertyCommentId}`;

      const default_email_subject = h.getMessageByCode(
        'template-commentPosted-subject-1624117067',
        {
          CONTACT_NAME:
            contactRecord.first_name + ' ' + contactRecord.last_name,
        },
      );

      const default_email_body = h.getMessageByCode(
        'template-commentPosted-body-1624116886',
        {
          CONTACT_NAME:
            contactRecord.first_name + ' ' + contactRecord.last_name,
          AGENT_FIRST_NAME: h.general.prettifyConstant(first_name),
          PROPERTY_NAME: fullPropertyName,
          MESSAGE: message,
          COMMENT_LINK: commentLink,
        },
      );
      if (send_email) {
        await h.email.sendEmail(
          `Chaaat <no-reply@chaaat.io>`,
          email, // To agent email
          null,
          default_email_subject,
          default_email_body,
        );
      } else {
        return { default_email_subject, default_email_body };
      }
    };

  /**
   *
   * @param request?: fastify request object
   * @param user_id?: string
   * @param contact_id?: string
   * @param permalink?: string
   * @param {{ send_email?: boolean, transaction?:object }} [options]
   * @returns {Promise<{email_body: string, email_subject: string}>}
   */
  shortlistedPropertyCommentEmailController.constructShortlistPropertyEmail =
    async (
      request,
      user_id,
      contact_id,
      permalink,
      { send_email = true, transaction } = {},
    ) => {
      const funcName =
        'shortlistedPropertyCommentEmail.constructShortlistPropertyEmail';
      h.validation.requiredParams(funcName, { user_id, contact_id, permalink });

      const [
        { email, first_name, hubspot_bcc_id },
        {
          agency_fk,
          agency_user_id,
          agency: { agency_name, agency_subdomain },
        },
        contactRecord,
      ] = await Promise.all([
        // Retrieve agency user details
        userController.findOne({ user_id }, { transaction }),
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
            transaction,
          },
        ),
        // Retrieve Buyer details
        contactController.findOne({ contact_id }, { transaction }),
      ]);

      const buyerFirstName = contactRecord.first_name;
      const buyerEmail = contactRecord.email;

      // Permalink to send
      const sendPermalink = h.route.createPermalink(
        agency_subdomain,
        config.webUrl,
        agency_name,
        contactRecord,
        permalink,
      );

      let integrationExists = false;
      const [contactEmailCommunicationRecord, apiRes] = await Promise.all([
        // find the customized email to send in email communication records
        contactEmailCommunicationController.findAll(
          { contact_fk: contact_id, agency_user_fk: agency_user_id },
          { order: [['created_date', 'DESC']] },
        ),
        api.integrations.getAgencyUserActiveIntegrations(request, {
          agency_user_id,
          agency_fk,
        }),
      ]);

      const default_email_subject = h.getMessageByCode(
        'template-shortlisted-property-subject-1624117469',
      );
      const default_email_body = h.getMessageByCode(
        'template-shortlisted-property-body-1624117475',
        {
          BUYER_FIRST_NAME: buyerFirstName,
          AGENT_FIRST_NAME: h.general.prettifyConstant(first_name),
          AGENCY_NAME: agency_name,
          PERMALINK: sendPermalink,
        },
      );

      const custom_email_subject = h.notEmpty(contactEmailCommunicationRecord)
        ? contactEmailCommunicationRecord[0].email_subject
        : default_email_subject;
      const custom_email_body = h.notEmpty(contactEmailCommunicationRecord)
        ? contactEmailCommunicationRecord[0].email_body
        : default_email_body;

      const activeIntegrations =
        apiRes.status === 'ok' ? apiRes.data.active_integrations : '';

      let emailSent = false;

      // try sending via gmail
      if (
        h.notEmpty(activeIntegrations) &&
        activeIntegrations.gmail ===
          constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE
      ) {
        if (send_email) {
          try {
            const gmail_webhook = await trayIntegrationsController.getWebhook(
              agency_user_id,
              constant.TRAY.USER_SOLUTION_SOURCE_TYPE.GMAIL,
            );
            if (h.notEmpty(gmail_webhook)) {
              emailSent = await sendTrayGmailEmail(
                gmail_webhook,
                email,
                buyerEmail,
                buyerFirstName,
                email,
                first_name,
                custom_email_subject,
                custom_email_body,
                hubspot_bcc_id,
              );
            }
          } catch (error) {
            console.log(`${funcName}: ${error}`);
          }
        } else {
          integrationExists = true;
        }
      }

      // if emailSent is false that implies gmail wasn't active or failed.
      // try sending via outlook
      if (
        h.notEmpty(activeIntegrations) &&
        !emailSent &&
        activeIntegrations.outlook ===
          constant.TRAY.USER_SOLUTION_INSTANCE_STATUS.ACTIVE
      ) {
        if (send_email) {
          try {
            const outlook_webhook = await trayIntegrationsController.getWebhook(
              agency_user_id,
              constant.TRAY.USER_SOLUTION_SOURCE_TYPE.OUTLOOK,
            );
            if (h.notEmpty(outlook_webhook)) {
              emailSent = await sendTrayOutlookEmail(
                outlook_webhook,
                buyerEmail,
                first_name,
                custom_email_subject,
                custom_email_body,
                hubspot_bcc_id,
              );
            }
          } catch (error) {
            console.log(`${funcName}: ${error}`);
          }
        } else {
          integrationExists = true;
        }
      }

      // if emailSent is false that implies outlook and gmail emails didn't go through
      if (!emailSent && send_email) {
        // send email default
        await h.email.sendEmail(
          `Chaaat <no-reply@chaaat.io>`,
          buyerEmail, // To buyer email
          null,
          default_email_subject,
          default_email_body,
        );
      }
      if (!send_email) {
        // send the message back when the send_email boolean is false
        const email_subject =
          integrationExists && h.notEmpty(custom_email_subject)
            ? custom_email_subject
            : default_email_subject;
        const email_body =
          integrationExists && h.notEmpty(custom_email_body)
            ? custom_email_body
            : default_email_body;

        return { email_subject, email_body };
      }
    };
  /**
   * this will only construct a generic email
   * @param user_id?: string
   * @param {{ send_email?: boolean, transaction?:object }} [options]
   * @returns {Promise<{email_body: string, email_subject: string}>}
   */
  shortlistedPropertyCommentEmailController.constructShortlistPropertyEmailV2 =
    async (user_id, { transaction } = {}) => {
      const funcName =
        'shortlistedPropertyCommentEmail.constructShortlistPropertyEmailV2';
      h.validation.requiredParams(funcName, { user_id });

      const [
        { first_name },
        {
          agency: { agency_name },
        },
      ] = await Promise.all([
        // Retrieve agency user details
        userController.findOne({ user_id }, { transaction }),
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
            transaction,
          },
        ),
      ]);

      const default_email_subject = h.getMessageByCode(
        'template-shortlisted-property-subject-1624117469',
      );
      const default_email_body = h.getMessageByCode(
        'template-shortlisted-property-body-1624117475',
        {
          AGENT_FIRST_NAME: h.general.prettifyConstant(first_name),
          AGENCY_NAME: agency_name,
        },
      );
      const email_subject = default_email_subject;
      const email_body = default_email_body;

      return { email_subject, email_body };
    };

  return shortlistedPropertyCommentEmailController;
};
