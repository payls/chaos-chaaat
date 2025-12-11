const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const models = require('../../../models');
const { Op } = require('sequelize');
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');
const contactController =
  require('../../../controllers/contact').makeContactController(models);
const shortlistedProjectController =
  require('../../../controllers/shortlistedProject').makeShortListedProjectController(
    models,
  );
const shortlistedPropertyController =
  require('../../../controllers/shortListedProperty').makeShortListedPropertyController(
    models,
  );
const shortlistedPropertyCommentEmailController =
  require('../../../controllers/shortlistedPropertyCommentEmail').makeShortlistedPropertyCommentEmailController(
    models,
  );
const agencyUserEmailOauthController =
  require('../../../controllers/agencyUserEmailOauth').makeAgencyUserEmailOauthController(
    models,
  );
const gmailIntegrationController =
  require('../../../controllers/gmailIntegrations').makeGmailIntegrationController(
    models,
  );
const userRoleController =
  require('../../../controllers/userRole').makeUserRoleController(models);
const agencyUserController =
  require('../../../controllers/agencyUser').makeAgencyUserController(models);
const contactEmailCommunicationController =
  require('../../../controllers/contactEmailCommunication').makeContactEmailCommunicationController(
    models,
  );
const contactLeadScoreController =
  require('../../../controllers/contactLeadScore').makeContactLeadScoreController(
    models,
  );
const contactActivityController =
  require('../../../controllers/contactActivity').makeContactActivityController(
    models,
  );
const StaffContactLinkService = require('../../../services/staff/contactLink');
const { catchError } = require('../../../helpers/error');
const { sendGmailEmail, getTokens } = require('../../../services/email/gmail');

module.exports = (fastify, opts, next) => {
  /**
   * @api {get} /v1/staff/contact/Link/get-unique-permalink Search for unique permalink
   * @apiName StaffContactLinkSearchPermalink
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact Link
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/contact/link/get-unique-permalink',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            contacts: { type: 'array' },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      try {
        const { user_id: current_user_id } = h.user.getCurrentUser(request);
        const { agency_fk, agency_user_id } =
          await agencyUserController.findOne({ user_fk: current_user_id });
        const userRoleRecord = await userRoleController.findOne({
          user_fk: current_user_id,
        });

        const { query } = request.query;

        const splitedQuery = request.query.query.split(' ');
        const firstNameQuery = splitedQuery[0];
        const lastNameQuery = splitedQuery[splitedQuery.length - 1];

        let contacts = [];

        if (userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES) {
          contacts = await contactController.findAll(
            {
              agency_fk,
              [Op.or]: [
                { first_name: { [Op.like]: `%${firstNameQuery}%` } },
                { last_name: { [Op.like]: `%${lastNameQuery}%` } },
                { permalink: { [Op.like]: `%${query}%` } },
                {
                  '$agency_user.user.first_name$': {
                    [Op.like]: `%${firstNameQuery}%`,
                  },
                },
                {
                  '$agency_user.user.last_name$': {
                    [Op.like]: `%${lastNameQuery}%`,
                  },
                },
              ],
              [Op.or]: [
                { agency_user_fk: agency_user_id },
                { created_by: current_user_id },
              ],
            },
            {
              include: [
                {
                  model: models.agency_user,
                  required: false,
                  include: [
                    {
                      model: models.user,
                      required: true,
                    },
                    {
                      model: models.agency,
                      required: true,
                    },
                  ],
                },
              ],
            },
          );
        } else {
          contacts = await contactController.findAll(
            {
              agency_user_fk: { [Op.ne]: null },
              permalink: { [Op.ne]: null },
              agency_fk,
              [Op.or]: [
                { first_name: { [Op.like]: `%${firstNameQuery}%` } },
                { last_name: { [Op.like]: `%${lastNameQuery}%` } },
                { permalink: { [Op.like]: `%${query}%` } },
                {
                  '$agency_user.user.first_name$': {
                    [Op.like]: `%${firstNameQuery}%`,
                  },
                },
                {
                  '$agency_user.user.last_name$': {
                    [Op.like]: `%${lastNameQuery}%`,
                  },
                },
              ],
            },
            {
              include: [
                {
                  model: models.agency_user,
                  required: false,
                  include: [
                    {
                      model: models.user,
                      required: true,
                    },
                    {
                      model: models.agency,
                      required: true,
                    },
                  ],
                },
              ],
            },
          );
        }

        h.api.createResponse(
          request,
          response,
          200,
          { contacts },
          '1-contactLink-1623032712200',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: user failed to retrieve contacts list`, {
          err,
        });
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-contactLink-1623032742565',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/contact/Link Staff update contact Link
   * @apiName StaffContactLinkUpdate
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact Link
   * @apiUse ServerError
   *
   * @apiParam {string} first_name First Name
   * @apiParam {string} last_name Last Name
   * @apiParam {string} email Sub Email
   * @apiParam {string} mobile_number Mobile Number
   * @apiParam {string} permalink Permalink
   * @apiParam {string} profile_picture_url Profile Picture
   * @apiParam {string} agency_id Agency ID
   * @apiParam {string} [agency_user_id] Agency User ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} contact_id Contact id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "contact_id": "1234"
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/staff/contact/link',
    schema: {
      body: {
        type: 'object',
        properties: {
          contact_id: { type: 'string' },
          permalink: { type: 'string' },
          autogenerate_permalink: { type: 'boolean' },
          unit_ids: { type: 'array' },
          is_general_enquiry: { type: 'boolean' },
          permalink_template: { type: 'string' },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      const staffContactLinkService = new StaffContactLinkService();
      const [err, { isNew, contact, permalink }] = await h.database.transaction(
        async (transaction) => {
          staffContactLinkService.setDbTransaction(transaction);
          return catchError(staffContactLinkService.updateContactLink(request));
        },
      );
      if (err) {
        Sentry.captureException(err);
        return h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-contactLink-1624469211980',
          { portal },
        );
      } else {
        console.log(contact);
        return h.api.createResponse(
          request,
          response,
          200,
          { contact: contact, permalink },
          isNew ? '1-contactLink-1621772306' : '1-contactLink-1624469170895',
          { portal },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/contact/Link Get contacts Link list
   * @apiName StaffContactLinkGetLink
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact Link
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/contact/link',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            contacts: { type: 'array' },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      try {
        const { user_id: current_user_id } = h.user.getCurrentUser(request);
        const { agency_fk, agency_user_id } =
          await agencyUserController.findOne({ user_fk: current_user_id });
        const userRoleRecord = await userRoleController.findOne({
          user_fk: current_user_id,
        });
        let contacts = [];

        if (userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES) {
          contacts = await contactController.findAll(
            {
              status: constant.CONTACT.STATUS.ACTIVE,
              agency_fk,
              [Op.and]: [
                { permalink: { [Op.ne]: null } },
                { permalink: { [Op.ne]: '' } },
              ],
              [Op.or]: [
                { agency_user_fk: agency_user_id },
                { created_by: current_user_id },
              ],
            },
            {
              include: [
                {
                  model: models.agency_user,
                  required: true,
                  include: [
                    {
                      model: models.user,
                      required: true,
                    },
                    { model: models.agency, required: true },
                  ],
                },
              ],
            },
          );
        } else {
          contacts = await contactController.findAll(
            {
              status: constant.CONTACT.STATUS.ACTIVE,
              agency_fk,
              [Op.and]: [
                { permalink: { [Op.ne]: null } },
                { permalink: { [Op.ne]: '' } },
              ],
            },
            {
              include: [
                {
                  model: models.agency_user,
                  required: true,
                  include: [
                    {
                      model: models.user,
                      required: true,
                    },
                    {
                      model: models.agency,
                      required: true,
                      where: { agency_id: agency_fk },
                    },
                  ],
                },
              ],
            },
          );
        }

        h.api.createResponse(
          request,
          response,
          200,
          { contacts },
          '1-contactLink-1621773084',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: user failed to retrieve contacts list`, {
          err,
        });
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-contactLink-1621773105',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {delete} /v1/staff/contact/Link Staff delete contact
   * @apiName StaffContactLinkDelete
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact Link
   * @apiUse ServerError
   *
   * @apiParam {string} contact_id Contact ID
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} contact_id Contact id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "contact_id": "1234"
   * }
   */
  fastify.route({
    method: 'DELETE',
    url: '/staff/contact/link',
    schema: {
      query: {
        type: 'object',
        required: ['contact_id'],
        properties: {
          contact_id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            contact_id: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      try {
        const { contact_id } = request.query;
        const { user_id } = h.user.getCurrentUser(request);

        const updatedContactId = await h.database.transaction(
          async (transaction) => {
            await shortlistedProjectController.softDestroyAll(
              {
                contact_fk: contact_id,
              },
              { transaction },
            );
            await shortlistedPropertyController.softDestroyAll(
              {
                contact_fk: contact_id,
              },
              { transaction },
            );

            await contactLeadScoreController.destroyAll(
              { contact_fk: contact_id },
              { transaction },
            );
            await contactActivityController.softDestroyAll(
              {
                contact_fk: contact_id,
              },
              { transaction },
            );
            const updatedContactId = await contactController.update(
              contact_id,
              {
                permalink: null,
                permalink_sent_date: null,
                permalink_last_opened: null,
                lead_score: 0,
                last_24_hour_lead_score: 0,
                last_48_hour_lead_score: 0,
                last_24_hour_lead_score_diff: 0,
                lead_status: constant.LEAD_STATUS.NO_PROPOSAL,
                buy_status: null,
                updated_by: user_id,
              },
              { transaction },
            );
            return updatedContactId;
          },
        );
        h.api.createResponse(
          request,
          response,
          200,
          { contact_id: updatedContactId },
          '1-contactLink-1622566911583',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: user failed to update contact record`, {
          err,
        });
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-contactLink-1622566930484',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/contact/link/permalink-message Staff update contact Link with permalink message
   * @apiName StaffContactPermalinkUpdate
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact Link
   * @apiUse ServerError
   *
   * @apiParam {string} contact_id contactId
   * @apiParam {string} permalink_message PermalinkMessage
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} contact_id Contact id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "contact_id": "1234"
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/staff/contact/link/permalink-message',
    schema: {
      body: {
        type: 'object',
        properties: {
          contact_id: { type: 'string' },
          permalink_message: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            contact_id: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      try {
        const { contact_id, permalink_message } = request.body;
        const { user_id } = h.user.getCurrentUser(request);
        const contactRecord = await contactController.findOne({ contact_id });

        if (contactRecord) {
          const updatedContactId = await h.database.transaction(
            async (transaction) => {
              return await contactController.update(
                contactRecord.contact_id,
                {
                  permalink_message,
                  updated_by: user_id,
                },
                { transaction },
              );
            },
          );

          h.api.createResponse(
            request,
            response,
            200,
            { contact_id: updatedContactId },
            '1-contactLink-1624469170895',
            { portal },
          );
        } else {
          h.api.createResponse(
            request,
            response,
            200,
            {},
            '1-contactLink-1624469170895',
            { portal },
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: user failed to update contact record`, {
          err,
        });
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-contactLink-1621773105',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/contact/link/email-preference Staff update contact Link email preferences
   * @apiName StaffContactEmailUpdate
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact Link
   * @apiUse ServerError
   *
   * @apiParam {string} contact_id contactId
   * @apiParam {boolean} agent_email_preference agentEmailPreference
   * @apiParam {boolean} contact_email_preference contactEmailPreference
   * @apiParam {string} invite_email_subject inviteEmailSubject
   * @apiParam {string} invite_email_body inviteEmailBody
   * @apiParam {boolean} email_integration_status emailIntegrationStatus
   * @apiParam {boolean} send_email Boolean flag to send email
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} contact_id Contact id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "contact_id": "1234"
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/staff/contact/link/email-preference',
    schema: {
      body: {
        type: 'object',
        properties: {
          contact_id: { type: 'string' },
          agent_email_preference: { type: 'boolean' },
          contact_email_preference: { type: 'boolean' },
          invite_email_subject: { type: 'string' },
          invite_email_body: { type: 'string' },
          email_integration_status: { type: 'boolean' },
          send_email: { type: 'boolean' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            contact_id: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      try {
        const {
          contact_id,
          agent_email_preference,
          contact_email_preference,
          invite_email_subject,
          invite_email_body,
          email_integration_status,
          send_email,
        } = request.body;
        const { user_id } = h.user.getCurrentUser(request);
        const contactRecord = await contactController.findOne({ contact_id });
        const agencyUser = await agencyUserController.findOne({
          user_fk: user_id,
        });

        let message_code = ''; // 1-contactLink-1624469170895 - updated contact successfully - can't send as per requirement.
        if (contactRecord) {
          const { updatedContactId, newLeadStatus } =
            await h.database.transaction(async (transaction) => {
              // update lead status to proposal_sent / updated_proposal_sent if sending email
              let newLeadStatus;

              if (contact_email_preference && send_email) {
                const oldContactRecord = await contactController.findOne(
                  { contact_id },
                  { transaction },
                );

                if (
                  h.general.cmpStr(
                    oldContactRecord.lead_status,
                    constant.LEAD_STATUS.PROPOSAL_CREATED,
                  )
                ) {
                  newLeadStatus = constant.LEAD_STATUS.PROPOSAL_SENT;
                } else if (
                  h.general.cmpStr(
                    oldContactRecord.lead_status,
                    constant.LEAD_STATUS.UPDATED_PROPOSAL_CREATED,
                  )
                ) {
                  newLeadStatus = constant.LEAD_STATUS.UPDATED_PROPOSAL_SENT;
                }
              }

              const whereClause = {
                agent_email_preference,
                contact_email_preference,
                updated_by: user_id,
              };

              if (newLeadStatus) {
                whereClause.lead_status = newLeadStatus;
                whereClause.permalink_sent_date = h.date.getSqlCurrentDate();
              }

              const updatedContactId = await contactController.update(
                contactRecord.contact_id,
                whereClause,
                { transaction },
              );

              if (email_integration_status) {
                await contactEmailCommunicationController.create(
                  {
                    contact_fk: updatedContactId,
                    agency_user_fk: agencyUser.agency_user_id,
                    email_body: invite_email_body,
                    email_subject: invite_email_subject,
                    email_meta: null,
                    created_by: updatedContactId,
                  },
                  { transaction },
                );
              }
              return { updatedContactId, newLeadStatus };
            });

          if (contact_email_preference && send_email) {
            // Send shortlisted property email to buyer contact
            await shortlistedPropertyCommentEmailController.constructShortlistPropertyEmail(
              request,
              user_id,
              contact_id,
              contactRecord.permalink,
            );
            message_code = '1-contactLink-1637887186363'; // Sent email to contact successfully.
          }

          // logging to hubspot
          const updatedRecord = await contactController.findOne(
            { contact_id: updatedContactId },
            {
              include: [
                {
                  model: models.contact_source,
                  required: true,
                  where: {
                    contact_fk: contact_id,
                    source_type:
                      constant.TRAY.USER_SOLUTION_SOURCE_TYPE.HUBSPOT,
                  },
                },
                {
                  model: models.shortlisted_property,
                  required: true,
                  include: [
                    {
                      model: models.project_property,
                      required: true,
                      include: [
                        {
                          model: models.project,
                          required: true,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          );

          if (
            h.general.notEmpty(updatedRecord) &&
            (h.general.cmpStr(
              newLeadStatus,
              constant.LEAD_STATUS.PROPOSAL_SENT,
            ) ||
              h.general.cmpStr(
                newLeadStatus,
                constant.LEAD_STATUS.UPDATED_PROPOSAL_SENT,
              ))
          ) {
            const projects = [];
            let proposal_activity_type = null;
            updatedRecord.shortlisted_properties.map((data) => {
              projects.push(data.project_property.project.name);
            });
            proposal_activity_type = newLeadStatus;
            try {
              const meta = { proposed_projects: projects.join(' | ') };
              await contactActivityController.logActivityToHubSpot(
                {
                  contact_fk: updatedContactId,
                  activity_type: proposal_activity_type,
                  activity_meta: JSON.stringify(meta),
                  activity_date: h.date.getSqlCurrentDate(),
                  created_by: updatedContactId,
                },
                {},
                request,
              );
            } catch (err) {
              Sentry.captureException(err);
              console.log(`failed to log activity to hubspot: ${err}`);
            }

            try {
              const meta = { proposed_projects: projects.join(' | ') };
              await contactActivityController.logActivityToHubSpotDirect(
                {
                  contact_fk: updatedContactId,
                  activity_type: proposal_activity_type,
                  activity_meta: JSON.stringify(meta),
                  activity_date: h.date.getSqlCurrentDate(),
                  created_by: updatedContactId,
                },
                {},
                request,
              );
            } catch (err) {
              Sentry.captureException(err);
              console.log(`failed to log activity to hubspot Direct: ${err}`);
            }

            try {
              const meta = { proposed_projects: projects.join(' | ') };
              await contactActivityController.logActivityToSalesforce(
                {
                  contact_fk: updatedContactId,
                  activity_type: proposal_activity_type,
                  activity_meta: JSON.stringify(meta),
                  activity_date: h.date.getSqlCurrentDate(),
                  created_by: updatedContactId,
                },
                {},
                request,
              );
            } catch (err) {
              Sentry.captureException(err);
              console.log(`failed to log activity to salesforce: ${err}`);
            }

            try {
              const meta = { proposed_projects: projects.join(' | ') };
              await contactActivityController.logActivityToSalesforceDirectIntegration(
                {
                  contact_fk: updatedContactId,
                  activity_type: proposal_activity_type,
                  activity_meta: JSON.stringify(meta),
                  activity_date: h.date.getSqlCurrentDate(),
                  created_by: updatedContactId,
                },
                {},
                request,
              );
            } catch (err) {
              Sentry.captureException(err);
              console.log(
                `failed to log activity to salesforce direct: ${err}`,
              );
            }
          }
        } else {
          message_code = '2-contact-1621773339'; // Failed to retrieve contact.
        }
        h.api.createResponse(request, response, 200, {}, message_code, {
          portal,
        });
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: user failed to update contact record`, {
          err,
        });
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-contactLink-1621773105', // Failed to retrieve contact links.
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/contact/link/send-email',
    // schema: {
    //   body: {
    //     type: 'object',
    //     properties: {
    //       contact_id: { type: 'string' },
    //       agent_email_preference: { type: 'boolean' },
    //       contact_email_preference: { type: 'boolean' },
    //       invite_email_subject: { type: 'string' },
    //       invite_email_body: { type: 'string' },
    //       email_integration_status: { type: 'boolean' },
    //       send_email: { type: 'boolean' },
    //     },
    //   },
    //   response: {
    //     200: {
    //       type: 'object',
    //       properties: {
    //         oauth: { type: 'object' },
    //       },
    //     },
    //   },
    // },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      let tokens = {};
      try {
        const oauth = await gmailIntegrationController.sendEmail({
          agency_user_fk: 'ee7854b7-b16d-42f8-a81a-b0eb0e54bd4a',
          email: 'ian+apitest@yourpave.com',
          subject: 'TEST SUBJECT',
          body: 'TEST BODY',
        });

        // const oauth = await agencyUserEmailOauthController.findOne(
        //   {
        //     agency_user_fk: 'ee7854b7-b16d-42f8-a81a-b0eb0e54bd4a',
        //     status: 'ACTIVE',
        //     source: 'GMAIL',
        //   },
        //   {
        //     include: [
        //       {
        //         model: models.agency_user,
        //         required: true,
        //         include: [
        //           {
        //             model: models.user,
        //             required: true,
        //           },
        //         ],
        //       },
        //     ],
        //   },
        // );
        // if (oauth) {
        //   // const { access_info, agency_user_email_oauth_id } = oauth.dataValues;
        //   // tokens = JSON.parse(access_info);
        //   // // Execute get access token and refresh token if no saved refresh_token
        //   // if (!h.notEmpty(tokens.refresh_token) && h.notEmpty(tokens.code)) {
        //   //   tokens = await getTokens(tokens.code);
        //   //   if (!tokens.error) {
        //   //     // Update acccess info
        //   //     await agencyUserEmailOauthController.update(
        //   //       agency_user_email_oauth_id,
        //   //       {
        //   //         access_info: JSON.stringify({
        //   //           code: tokens.code,
        //   //           access_token: tokens.access_token,
        //   //           refresh_token: tokens.refresh_token,
        //   //         }),
        //   //       },
        //   //     );
        //   //   }
        //   // }
        //   // await sendGmailEmail({
        //   //   senderName: 'Ian Ona',
        //   //   senderEmail: 'ian@yourpave.com',
        //   //   receiverEmail: 'ian+apitest@yourpave.com',
        //   //   subject: 'Sample test email',
        //   //   body: 'Email Body',
        //   //   accessToken: tokens.access_token,
        //   //   refreshToken: tokens.refresh_token,
        //   // });
        // }

        h.api.createResponse(request, response, 200, { oauth }, 'Sent', {
          portal,
        });
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-contactLink-1621773105', // Failed to retrieve contact links.
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/contact/link/get-email-message Staff get contact Link email template
   * @apiName StaffContactEmailMessage
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact Link
   * @apiUse ServerError
   *
   * @apiParam {string} contact_id contactId
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} contact_id Contact id.
   * @apiSuccess {string} invite_email_subject inviteEmailSubject
   * @apiSuccess {string} invite_email_body inviteEmailBody
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "contact_id": "1234",
   *      "invite_email_subject": "Invite email subject",
   *      "invite_email_body": "Invite email body"
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/staff/contact/link/get-email-message',
    schema: {
      body: {
        type: 'object',
        properties: {
          contact_id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            contact_id: { type: 'string' },
            invite_email_subject: { type: 'string' },
            invite_email_body: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      try {
        const { contact_id } = request.body;
        const { user_id } = h.user.getCurrentUser(request);
        const contactRecord = await contactController.findOne({ contact_id });

        const send_email = false;
        if (contactRecord) {
          const { email_subject, email_body } =
            await shortlistedPropertyCommentEmailController.constructShortlistPropertyEmail(
              request,
              user_id,
              contact_id,
              contactRecord.permalink,
              { send_email },
            );
          h.api.createResponse(
            request,
            response,
            200,
            {
              contact_id: contact_id,
              invite_email_subject: email_subject,
              invite_email_body: email_body,
            },
            '1-contactLink-1634074635889',
            { portal },
          );
        } else {
          h.api.createResponse(
            request,
            response,
            500,
            { contact_id: contact_id },
            '2-contactLink-1621773105',
            { portal },
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: user failed to update contact record`, {
          err,
        });
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-contactLink-1621773105',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/contact/link/get-generic-email-message Staff get contact Link email template
   * @apiName StaffContactEmailMessage
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact Link
   * @apiUse ServerError
   *
   * @apiParam {string} contact_id contactId
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} contact_id Contact id.
   * @apiSuccess {string} invite_email_subject inviteEmailSubject
   * @apiSuccess {string} invite_email_body inviteEmailBody
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "contact_id": "1234",
   *      "invite_email_subject": "Invite email subject",
   *      "invite_email_body": "Invite email body"
   * }
   */
  fastify.route({
    method: 'GET',
    url: '/staff/contact/link/get-generic-email-message',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            invite_email_subject: { type: 'string' },
            invite_email_body: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      try {
        const { user_id } = h.user.getCurrentUser(request);

        const { email_subject, email_body } =
          await shortlistedPropertyCommentEmailController.constructShortlistPropertyEmailV2(
            user_id,
          );
        h.api.createResponse(
          request,
          response,
          200,
          {
            invite_email_subject: email_subject,
            invite_email_body: email_body,
          },
          '1-contactLink-1634074635889',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: user failed to update contact record`, {
          err,
        });
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-contactLink-1621773105',
          {
            portal,
          },
        );
      }
    },
  });

  next();
};
