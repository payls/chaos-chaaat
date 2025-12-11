const h = require('../helpers');
const config = require('../configs/config')(process.env.NODE_ENV);
const constant = require('../constants/constant.json');
const api = require('../api');
const { sendTrayOutlookEmail } = require('../services/tray/outlook');
const { sendTrayGmailEmail } = require('../services/tray/gmail');

module.exports.makeShortlistedProjectCommentEmailController = (models) => {
  const userController = require('./user').makeUserController(models);
  const agencyUserController =
    require('./agencyUser').makeAgencyUserController(models);
  const agencyController = require('./agency').makeAgencyController(models);
  const contactController = require('./contact').makeContactController(models);
  const shortListedProjectController =
    require('./shortlistedProject').makeShortListedProjectController(models);

  const projectController = require('./project').makeProjectController(models);
  const contactEmailCommunicationController =
    require('./contactEmailCommunication').makeContactEmailCommunicationController(
      models,
    );
  const trayIntegrationsController =
    require('./trayIntegrations').makeTrayIntegrationsController(models);

  const shortlistedProjectCommentEmailController = {};

  /**
   * Construct email to send to buyer contact upon comment creation
   * @param request?: fastify request object
   * @param user_id?: string
   * @param contact_id?: string
   // * @param unit?: object
   * @param message?: object
   * @param shortlisted_project_id?: string
   * @param shortlistedProjectCommentId?: string
   * @param {{ send_email?: boolean ,transaction?:object }} [options]
   * @returns {Promise<{default_email_subject: string, default_email_body: string}>} if send_email is false
   */
  shortlistedProjectCommentEmailController.constructCommentEmailToBuyer =
    async (
      request,
      user_id,
      contact_id,
      // unit,
      message,
      shortlisted_project_id,
      shortlistedProjectCommentId,
      { send_email = true, transaction } = {},
    ) => {
      const funcName =
        'shortlistedProjectCommentEmail.constructCommentEmailToBuyer';
      h.validation.requiredParams(funcName, {
        user_id,
        contact_id,
        // unit,
        message,
        shortlisted_project_id,
        shortlistedProjectCommentId,
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

      // project details
      const shortListedProject = await shortListedProjectController.findOne({
        shortlisted_project_id,
      });

      const { project_fk } = shortListedProject;

      const project = await projectController.findOne({
        project_id: project_fk,
      });

      const projectName = project.name || '';
      const fullProjectName = `${projectName}`;
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
          BUYER_FIRST_NAME: buyerFirstName && buyerFirstName.trim(),
          AGENT_FIRST_NAME: first_name && first_name.trim(),
          AGENCY_NAME: agency_name,
          PROJECT_NAME: fullProjectName,
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
                first_name && first_name.trim(),
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
   * @param shortlisted_project_id?: string
   * @param shortlistedProjectCommentId?: string
   * @param {{ send_email?: boolean, transaction?:object }} [options]
   * @returns {Promise<{default_email_subject: string, default_email_body: string}>} if send_email is false
   */
  shortlistedProjectCommentEmailController.constructCommentEmailToAgent =
    async (
      contact_id,
      message,
      shortlisted_project_id,
      shortlistedProjectCommentId,
      { send_email = true, transaction } = {},
    ) => {
      const funcName =
        'shortlistedProjectCommentEmail.constructCommentEmailToAgent';
      h.validation.requiredParams(funcName, {
        contact_id,
        message,
        shortlisted_project_id,
        shortlistedProjectCommentId,
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
      // Retrieve project details
      const shortlistedProject = await shortListedProjectController.findOne({
        shortlisted_project_id,
      });

      // project_project_fk = local database project ID
      // project_fk = WordPress Content site's unit ID
      const { project_fk } = shortlistedProject;

      const project = await projectController.findOne({
        project_id: project_fk,
      });
      const projectName = project.name || '';

      const fullProjectName = `${projectName}`;
      // Link to admin dashboard comment
      const commentLink = `${config.webAdminUrl}/dashboard/comments/${shortlistedProjectCommentId}`;

      const default_email_subject = h.getMessageByCode(
        'template-commentPosted-subject-1658731996904',
        {
          CONTACT_NAME:
            contactRecord.first_name + ' ' + contactRecord.last_name,
        },
      );

      const default_email_body = h.getMessageByCode(
        'template-commentPosted-body-1658732002183',
        {
          CONTACT_NAME:
            contactRecord.first_name + ' ' + contactRecord.last_name,
          AGENT_FIRST_NAME: h.general.prettifyConstant(first_name),
          PROJECT_NAME: fullProjectName,
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
  shortlistedProjectCommentEmailController.constructShortlistProjectEmail =
    async (
      request,
      user_id,
      contact_id,
      permalink,
      { send_email = true, transaction } = {},
    ) => {
      const funcName =
        'shortlistedProjectCommentEmail.constructShortlistProjectEmail';
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
        'template-shortlisted-project-subject-1624117469',
      );
      const default_email_body = h.getMessageByCode(
        'template-shortlisted-project-body-1624117475',
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

  return shortlistedProjectCommentEmailController;
};
