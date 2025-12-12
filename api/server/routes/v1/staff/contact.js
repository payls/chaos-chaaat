const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const models = require('../../../models');
const sequelize = require('sequelize');
const { Op } = sequelize;
const c = require('../../../controllers');
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');
const agencyMiddleware = require('../../../middlewares/agency');
const jsforce = require('jsforce');
const config = require('../../../configs/config')(process.env.NODE_ENV);
const BPromise = require('bluebird');
const Axios = require('axios');
const moment = require('moment');
const { Client } = require('@hubspot/api-client');
const contactController =
  require('../../../controllers/contact').makeContactController(models);
const contactActivityController =
  require('../../../controllers/contactActivity').makeContactActivityController(
    models,
  );
const contactSourceController =
  require('../../../controllers/contactSource').makeContactSourceController(
    models,
  );
const agencyUserController =
  require('../../../controllers/agencyUser').makeAgencyUserController(models);
const userRoleController =
  require('../../../controllers/userRole').makeUserRoleController(models);
const projectPropertyController =
  require('../../../controllers/projectProperty').makeProjectPropertyController(
    models,
  );

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/staff/contact Staff create contact record
   * @apiName StaffContactCreate
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
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
    url: '/staff/contact',
    schema: {
      body: {
        type: 'object',
        required: ['first_name', 'agency_id'],
        properties: {
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          email: { type: 'string' },
          mobile_number: { type: 'string' },
          is_whatsapp: { type: 'boolean' },
          is_agency_sms_connection: { type: 'boolean' },
          permalink: { type: 'string' },
          profile_picture_url: { type: 'string' },
          agency_id: { type: 'string' },
          agency_user_id: { type: 'string' },
          company: { type: 'string' },
          status: { type: 'string' },
          opt_out_whatsapp: { type: 'boolean' },
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
      await agencyMiddleware.canAddActiveContact(request, reply);
    },
    handler: async (request, reply) => {
      try {
        const {
          first_name,
          last_name,
          email,
          mobile_number,
          is_whatsapp,
          is_agency_sms_connection,
          permalink,
          agency_id,
          profile_picture_url,
          agency_user_id,
          company,
          status,
          opt_out_whatsapp,
        } = request.body;
        const { user_id } = h.user.getCurrentUser(request);
        let adjusted_mobile_number = mobile_number.replaceAll('+', '');
        adjusted_mobile_number = adjusted_mobile_number.replaceAll(' ', '');
        adjusted_mobile_number = adjusted_mobile_number.replaceAll('(', '');
        adjusted_mobile_number = adjusted_mobile_number.replaceAll(')', '');
        adjusted_mobile_number = adjusted_mobile_number.replaceAll('-', '');
        adjusted_mobile_number = adjusted_mobile_number.replaceAll('.', '');
        const contactRecord = await contactController.findOne({
          mobile_number: adjusted_mobile_number,
          email,
          agency_fk: agency_id,
        });

        // Check if contact record already exist base on email
        if (h.general.isEmpty(contactRecord) || h.isEmpty(email)) {
          const { contact_id, contact_source_id, agent } =
            await h.database.transaction(async (transaction) => {
              // Create contact record
              const contact_id = await contactController.create(
                {
                  first_name,
                  last_name,
                  email,
                  mobile_number: adjusted_mobile_number,
                  is_whatsapp,
                  is_agency_sms_connection,
                  permalink,
                  profile_picture_url,
                  company,
                  agency_fk: agency_id,
                  agency_user_fk: agency_user_id,
                  status: status,
                  opt_out_whatsapp,
                  opt_out_whatsapp_date: h.cmpBool(opt_out_whatsapp, true)
                    ? new Date()
                    : null,
                  created_by: user_id,
                },
                { transaction },
              );

              // Create contact_source_record
              const contact_source_id = await contactSourceController.create(
                {
                  contact_fk: contact_id,
                  created_by: user_id,
                },
                { transaction },
              );

              // Add handler to check if it is an assignment of contact to another agent
              let agent;
              if (agency_user_id) {
                // retrieve agency_user_id's user_id
                agent = await agencyUserController.findOne(
                  { agency_user_id },
                  { transaction },
                );
              }
              return { contact_id, contact_source_id, agent };
            });

          if (agent && agent.user_fk !== user_id) {
            // Check if its an update for contact assignment
            try {
              const canSend = await c.emailNotificationSetting.ifCanSendEmail(
                agency_user_id,
                'create_new_lead',
              );
              if (canSend) {
                await contactController.sendContactAssignmentNotificationEmail(
                  contact_id,
                );
              }
            } catch (err) {
              Sentry.captureException(err);
              console.log(
                `${request.url}: failed to send contact assignment email.`,
                {
                  err,
                },
              );
            }
          }
          // check if contact capacity is now 80 90 or 100
          await c.agencyNotification.checkContactCapacityAfterUpdate(agency_id);
          h.api.createResponse(
            request,
            reply,
            200,
            { contact_id, contact_source_id },
            '1-contact-1620396460',
            { portal },
          );
        } else {
          // Contact record already exist
          console.log(`${request.url}: contact already exist.`, {
            contactRecord,
          });
          h.api.createResponse(
            request,
            reply,
            409,
            {},
            '2-contact-1621771554',
            {
              portal,
            },
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to create contact.`, { err });
        h.api.createResponse(request, reply, 500, {}, '2-contact-1620396470', {
          portal,
        });
      }
    },
  });

  /**
   * @api {put} /v1/staff/contact Staff update contact
   * @apiName StaffContactUpdate
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerError
   *
   * @apiParam {string} contact_id Contact ID
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
    method: 'PUT',
    url: '/staff/contact',
    schema: {
      body: {
        type: 'object',
        required: ['contact_id'],
        properties: {
          contact_id: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          email: { type: 'string' },
          mobile_number: { type: 'string' },
          is_whatsapp: { type: 'boolean' },
          is_agency_sms_connection: { type: 'boolean' },
          permalink: { type: 'string' },
          profile_picture_url: { type: 'string' },
          agency_id: { type: 'string' },
          agency_user_id: { type: 'string' },
          buy_status: { type: 'string' },
          labels: { type: 'string' },
          company: { type: 'string' },
          status: { type: 'string' },
          paused_automation: { type: 'boolean' },
          opt_out_whatsapp: { type: 'boolean' },
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
      await agencyMiddleware.canAddActiveContact(request, reply);
    },
    handler: async (request, response) => {
      try {
        const {
          contact_id,
          first_name,
          last_name,
          email,
          mobile_number,
          is_whatsapp,
          is_agency_sms_connection,
          permalink,
          lead_status,
          profile_picture_url,
          agency_id,
          agency_user_id,
          buy_status,
          labels,
          status,
          company,
          paused_automation,
          opt_out_whatsapp,
        } = request.body;
        const { user_id } = h.user.getCurrentUser(request);
        let adjusted_mobile_number = mobile_number.replaceAll('+', '');
        adjusted_mobile_number = adjusted_mobile_number.replaceAll(' ', '');
        adjusted_mobile_number = adjusted_mobile_number.replaceAll('(', '');
        adjusted_mobile_number = adjusted_mobile_number.replaceAll(')', '');
        adjusted_mobile_number = adjusted_mobile_number.replaceAll('-', '');
        adjusted_mobile_number = adjusted_mobile_number.replaceAll('.', '');

        const { updatedContactId, isContactAssignment } =
          await h.database.transaction(async (transaction) => {
            let isContactAssignment = false;
            const oldRecord = await contactController.findOne(
              { contact_id },
              {
                include: [
                  {
                    model: models.agency_user,
                    required: false,
                  },
                ],
                transaction,
              },
            );

            h.leadStatus.validateStateChange(
              oldRecord.lead_status,
              lead_status,
            );

            // Check if its an update for contact assignment
            // and that permalink is null
            if (
              oldRecord.agency_user_fk !== agency_user_id &&
              h.isEmpty(permalink) &&
              h.isEmpty(oldRecord.permalink)
            ) {
              // retrieve agency_user_id's user_id
              const agent = await agencyUserController.findOne(
                { agency_user_id },
                { transaction },
              );
              const oldAgent = oldRecord && oldRecord.agency_user;

              if (
                agent?.user_fk &&
                agent?.user_fk !== user_id &&
                agent?.user_fk !== (oldAgent && oldAgent.user_fk)
              ) {
                isContactAssignment = true;
              }
            }

            let permalinkSentDate = null;
            if (
              h.general.cmpStr(
                lead_status,
                constant.LEAD_STATUS.PROPOSAL_SENT,
              ) ||
              h.general.cmpStr(
                lead_status,
                constant.LEAD_STATUS.UPDATED_PROPOSAL_SENT,
              )
            ) {
              permalinkSentDate = h.date.getSqlCurrentDate();
            }

            if (h.general.notEmpty(oldRecord.permalink_sent_date)) {
              permalinkSentDate = oldRecord.permalink_sent_date;
            }

            const updateStatus = status;
            let opt_out_whatsapp_date = oldRecord?.opt_out_whatsapp_date;
            if (h.cmpBool(opt_out_whatsapp, false)) {
              opt_out_whatsapp_date = null;
            }
            if (
              h.cmpBool(opt_out_whatsapp, true) &&
              h.isEmpty(opt_out_whatsapp_date)
            ) {
              opt_out_whatsapp_date = new Date();
            }

            const updatedContactId = await contactController.update(
              contact_id,
              {
                first_name,
                last_name,
                email,
                mobile_number: adjusted_mobile_number,
                is_whatsapp,
                is_agency_sms_connection,
                permalink,
                lead_status,
                buy_status,
                permalink_sent_date: permalinkSentDate,
                profile_picture_url,
                agency_fk: agency_id,
                agency_user_fk: agency_user_id,
                updated_by: user_id,
                status: updateStatus,
                opt_out_whatsapp,
                opt_out_whatsapp_date: h.notEmpty(opt_out_whatsapp_date)
                  ? opt_out_whatsapp_date
                  : null,
                labels,
                company,
                paused_automation,
              },
              { transaction },
            );

            const contactSalesforceRecord =
              await c.contactSalesforceData.findOne(
                {
                  agency_fk: agency_id,
                  contact_fk: contact_id,
                },
                {
                  order: [['created_date', 'DESC']],
                },
              );

            const contactSource = await contactSourceController.findOne(
              {
                contact_fk: contact_id,
                source_type: 'SALESFORCE',
              },
              {
                order: [['created_date', 'DESC']],
              },
            );

            // if there is a contact salesforce record - update details needed for pushing based on new contact record data
            if (
              h.notEmpty(contactSalesforceRecord) &&
              (h.notEmpty(first_name) ||
                h.notEmpty(last_name) ||
                h.notEmpty(email) ||
                h.notEmpty(mobile_number))
            ) {
              const languageArr = constant.LIVE_CHAT_LANGUAGE;
              const updateData = {};
              // checking the new first name field - must be not null
              if (h.notEmpty(first_name)) {
                updateData.first_name = first_name;
                contactSalesforceRecord.first_name = first_name;
              }

              // checking the new last name field - must be not null
              if (h.notEmpty(last_name)) {
                updateData.last_name = last_name;
                contactSalesforceRecord.last_name = last_name;
              }

              // checking the new email field - must be not null
              if (h.notEmpty(email)) {
                updateData.email = email;
                contactSalesforceRecord.email = email;
              }

              // checking the new mobile field - must be not null
              const cleanedup_mobile =
                h.mobile.cleanMobileNumber(mobile_number);
              if (h.notEmpty(mobile_number) && h.notEmpty(cleanedup_mobile)) {
                const contact_phone_parts =
                  h.mobile.getMobileParts(cleanedup_mobile);
                console.log('contact_phone_parts', contact_phone_parts);
                const formatted_contact_phone =
                  contact_phone_parts.countryCode +
                  ' ' +
                  contact_phone_parts.restOfNumber;
                updateData.mobile = formatted_contact_phone;
                contactSalesforceRecord.mobile = formatted_contact_phone;
              }

              // updating contact salesforce record based on new contact record values
              await c.contactSalesforceData.update(
                contactSalesforceRecord.contact_salesforce_data_id,
                updateData,
              );

              const liveChatSettings = await c.liveChatSettings.findOne({
                agency_fk: agency_id,
              });

              const agencyOauth = await c.agencyOauthCtlr.findOne({
                agency_fk: agency_id,
                status: 'active',
                source: 'SALESFORCE',
              });

              // preparing the language value
              if (h.notEmpty(languageArr[contactSalesforceRecord.language])) {
                contactSalesforceRecord.language =
                  languageArr[contactSalesforceRecord.language];
              }

              // checking interested city selected set in the SF form based on selection and based on mobile number
              // note that there is a possibility that there are agencies with no city data
              const interested_city = contactSalesforceRecord.interested_city;
              if (h.notEmpty(interested_city) && interested_city.length > 3) {
                const cityDetails = await models.agency_salesforce_city.findOne(
                  {
                    where: {
                      agency_fk: agency_id,
                      sf_city_id: interested_city,
                      language: 'en',
                    },
                  },
                );
                if (h.notEmpty(cityDetails)) {
                  const city = cityDetails.dataValues.code;
                  contactSalesforceRecord.interested_city = city;
                }
              }
              const { ek: encryptionKeys } = request.ek;
              await h.salesforce.updateSalesforceRecord(
                liveChatSettings,
                contactSalesforceRecord,
                agencyOauth,
                contactSource,
                encryptionKeys,
              );

              const contact_note = `First Name: ${
                contactSalesforceRecord.first_name
              }<br/>
                        Last Name: ${contactSalesforceRecord.last_name}<br/>
                        Email: ${contactSalesforceRecord.email}<br/>
                        Mobile: ${
                          contactSalesforceRecord.formatted_contact_phone
                        }<br/>
                        Language: ${contactSalesforceRecord.language}<br/>
                        Interested Product: ${
                          contactSalesforceRecord.interested_product
                        }<br/>
                        Interested City: ${
                          contactSalesforceRecord.interested_city
                        }<br/>
                        Lead Source: ${contactSalesforceRecord.lead_source}<br/>
                        Lead Channel: ${
                          contactSalesforceRecord.lead_source_lv1
                        }<br/>
                        Origin: ${contactSalesforceRecord.lead_source_lv2}<br/>
                        Marketing Enabled: ${
                          h.cmpBool(
                            contactSalesforceRecord.enable_marketing,
                            true,
                          )
                            ? 'Yes'
                            : 'No'
                        }<br/>
                        TNC Agreed: ${contactSalesforceRecord.tnc_date}`;
              const note_data = {
                contact_fk: contact_id,
                agency_user_fk: agency_user_id,
                note: contact_note,
              };
              await c.contactNoteCtlr.create(note_data);
            }

            // Unsubscribe dealz subscription if contact optout for whatsapp
            if (
              h.cmpStr(agency_id, process.env.DEALZ_AGENCY_ID) &&
              h.cmpBool(oldRecord?.opt_out_whatsapp, false) &&
              h.cmpBool(opt_out_whatsapp, true)
            ) {
              await c.contact.unsubscribeDealz({ request, contact_id });
            }

            if (h.cmpStr(agency_id, process.env.DEALZ_AGENCY_ID)) {
              await c.contact.updateContactToWix({ request, contact_id });
            }

            return { updatedContactId, isContactAssignment };
          });

        // Check if a contact is being assigned to new agent

        const canSend = await c.emailNotificationSetting.ifCanSendEmail(
          agency_user_id,
          'update_new_lead',
        );

        if (isContactAssignment && canSend) {
          // send contact assignment notification email
          try {
            await contactController.sendContactAssignmentNotificationEmail(
              contact_id,
            );
          } catch (err) {
            Sentry.captureException(err);
            console.log(
              `${request.url}: failed to send contact assignment email.`,
              {
                err,
              },
            );
          }
        }

        // check if contact capacity is now 80 90 or 100
        await c.agencyNotification.checkContactCapacityAfterUpdate(agency_id);

        h.api.createResponse(
          request,
          response,
          200,
          { contact_id: updatedContactId },
          '1-contact-1621772306',
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
          '2-contact-1621772321',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {put} /v1/staff/contact/:contact_id/set-appointment Staff update contact
   * @apiName StaffContactUpdate
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerError
   *
   * @apiParam {string} contact_id Contact ID
   * @apiPaaram {Date} appointment_date
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
    method: 'PUT',
    url: '/staff/contact/:contact_id/set-appointment',
    schema: {
      params: {
        type: 'object',
        required: ['contact_id'],
        properties: {
          contact_id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['appointment_date'],
        properties: {
          appointment_date: { type: 'string', format: 'date-time' },
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
        const { contact_id } = request.params;
        const { appointment_date } = request.body;
        const { user_id } = h.user.getCurrentUser(request);

        await contactController.update(contact_id, {
          appointment_date,
          has_appointment: true,
          updated_by: user_id,
        });

        h.api.createResponse(
          request,
          response,
          200,
          { contact_id: contact_id },
          '1-contact-1621772306',
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
          '2-contact-1621772321',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'DELETE',
    url: '/staff/contact/:contact_id/set-appointment',
    schema: {
      params: {
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
        const { contact_id } = request.params;
        const { user_id } = h.user.getCurrentUser(request);

        await contactController.update(contact_id, {
          has_appointment: false,
          updated_by: user_id,
        });

        h.api.createResponse(
          request,
          response,
          200,
          { contact_id: contact_id },
          '1-contact-1621772306',
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
          '2-contact-1621772321',
          {
            portal,
          },
        );
      }
    },
  });
  /**
   * @api {delete} /v1/staff/contact Staff delete contact
   * @apiName StaffContactDelete
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
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
    url: '/staff/contact',
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
            const updatedContactId = await contactController.update(
              contact_id,
              {
                status: constant.CONTACT.STATUS.DELETED,
                permalink: null,
                permalink_sent_date: null,
                permalink_last_opened: null,
                lead_score: 0,
                buy_status: null,
                lead_status: constant.LEAD_STATUS.NO_PROPOSAL,
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
          '1-contact-1622566911583',
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
          '2-contact-1622566930484',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {delete} /v1/staff/contact/bulk-delete Staff bulk delete contacts
   * @apiName StaffContactBulkDelete
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerError
   *
   * @apiSuccess {array} contact_ids List of contact IDs to delete
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {array} contact_ids List of contact IDs deleted
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "contact_id": ["1234", "2453"]
   * }
   */
  fastify.route({
    method: 'DELETE',
    url: '/staff/contact/bulk-delete',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      try {
        const { contact_ids } = request.body;
        const { user_id } = h.user.getCurrentUser(request);

        const deletedContactIds = await h.database.transaction(
          async (transaction) => {
            const deletedContactIds = [];
            for (const contact_id of contact_ids) {
              const deletedContactId = await contactController.update(
                contact_id,
                {
                  status: constant.CONTACT.STATUS.DELETED,
                  permalink: null,
                  permalink_sent_date: null,
                  permalink_last_opened: null,
                  lead_score: 0,
                  buy_status: null,
                  lead_status: constant.LEAD_STATUS.NO_PROPOSAL,
                  updated_by: user_id,
                },
                { transaction },
              );
              deletedContactIds.push(deletedContactId);
            }
            return deletedContactIds;
          },
        );

        h.api.createResponse(
          request,
          response,
          200,
          { contact_ids: deletedContactIds },
          '1-contact-1652766684694',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${request.url}: user failed to bulk delete contact records`,
          {
            err,
          },
        );
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-contact-1652766684694',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/contact Get contacts list
   * @apiName StaffContactGetContacts
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'POST',
    url: '/staff/contact/all-contacts',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            contacts: { type: 'array' },
            metadata: {
              type: 'object',
              properties: {
                pageCount: { type: 'integer' },
                pageIndex: { type: 'integer' },
                totalCount: { type: 'integer' },
              },
            },
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
        const { agency_user_id, agency_fk } =
          await agencyUserController.findOne({ user_fk: current_user_id });
        const userRoleRecord = await userRoleController.findOne({
          user_fk: current_user_id,
        });

        const {
          search,
          contactOwner,
          leadStatus,
          lastOpened,
          proposalSent,
          channel,
        } = request.body.setFilter;
        const moreFilter = request.body.moreFilter;
        const { pageSize, pageIndex, sortColumn, sortOrder, totalCount } =
          request.body.pagination;

        const offset = pageIndex
          ? parseInt(pageIndex) * parseInt(pageSize)
          : undefined;
        const limit = pageSize ? parseInt(pageSize) : undefined;

        let contacts = [];
        const orClause = [];
        let andClause = [];

        let where = {};

        if (!h.general.isEmpty(search)) {
          orClause.push(
            sequelize.where(
              sequelize.fn(
                'CONCAT',
                sequelize.col('contact.first_name'),
                ' ',
                sequelize.col('contact.last_name'),
              ),
              {
                [sequelize.Op.like]: `%${search.trim()}%`,
              },
            ),
            { mobile_number: { [Op.like]: `%${search.trim()}%` } },
            { email: { [Op.like]: `%${search.trim()}%` } },
          );
        }

        if (h.notEmpty(orClause)) {
          andClause = [
            ...andClause,
            {
              agency_fk,
            },
            {
              [Op.or]: orClause,
            },
          ];
        } else {
          andClause = [
            ...andClause,
            {
              agency_fk,
            },
          ];
        }

        if (
          !h.general.isEmpty(contactOwner) &&
          userRoleRecord.user_role !== constant.USER.ROLE.AGENCY_SALES
        ) {
          const contactOwnerArray = contactOwner.split(',');
          andClause.push({
            agency_user_fk: { [Op.or]: contactOwnerArray },
          });
        }

        if (!h.general.isEmpty(leadStatus)) {
          const leadStatusArray = leadStatus.split(',');
          andClause.push({
            status: { [Op.or]: leadStatusArray },
          });
        }

        if (!h.general.isEmpty(lastOpened)) {
          const lastOpenedArray = lastOpened.split(',');
          const lastOpenedOrClauses = [];

          for (const lastOpened of lastOpenedArray) {
            const threshold = new Date(h.date.getSqlCurrentDate());
            for (const dateFilter in constant.DATE_FILTER) {
              if (lastOpened === constant.DATE_FILTER[dateFilter].VALUE) {
                threshold.setDate(
                  threshold.getDate() -
                    constant.DATE_FILTER[dateFilter].DAYS_THRESHOLD,
                );
              }
            }
            lastOpenedOrClauses.push({ [Op.gt]: threshold });
          }

          // where.permalink_last_opened = { [Op.or]: lastOpenedOrClauses };
          andClause = [
            ...andClause,
            {
              permalink_last_opened: { [Op.or]: lastOpenedOrClauses },
            },
          ];
        }

        if (!h.general.isEmpty(proposalSent)) {
          const proposalSentArray = proposalSent.split(',');
          const proposalSentOrClauses = [];

          for (const proposalSent of proposalSentArray) {
            const threshold = new Date(h.date.getSqlCurrentDate());
            for (const dateFilter in constant.DATE_FILTER) {
              if (proposalSent === constant.DATE_FILTER[dateFilter].VALUE) {
                threshold.setDate(
                  threshold.getDate() -
                    constant.DATE_FILTER[dateFilter].DAYS_THRESHOLD,
                );
              }
            }
            proposalSentOrClauses.push({ [Op.gt]: threshold });
          }

          // where.permalink_sent_date = { [Op.or]: proposalSentOrClauses };
          andClause = [
            ...andClause,
            {
              permalink_sent_date: { [Op.or]: proposalSentOrClauses },
            },
          ];
        }

        let attributeStringArray = [];
        for (const key in moreFilter) {
          const genericFilterObject = moreFilter[key];
          if (genericFilterObject.attribute_type === 'string') {
            attributeStringArray = attributeStringArray.concat(
              genericFilterObject.attribute_value,
            );
          }
        }

        const wherePropertyValues = {};
        let contactIds;
        if (h.general.notEmpty(attributeStringArray)) {
          wherePropertyValues.attribute_value_string = attributeStringArray;
          const contactPropertyDefinitionsList =
            await models.contact_property_definitions.findAll({
              where: { agency_fk },
              attributes: ['contact_property_definition_id'],
            });
          const contactPropertyValuesList =
            await models.contact_property_values.findAll({
              where: {
                attribute_value_string: attributeStringArray,
                contact_property_definition_fk: {
                  [Op.in]: contactPropertyDefinitionsList.map(
                    ({ dataValues }) =>
                      dataValues.contact_property_definition_id,
                  ),
                },
              },
              attributes: ['contact_fk'],
            });
          contactIds = contactPropertyValuesList.map(
            ({ dataValues }) => dataValues.contact_fk,
          );
          contactIds = [...new Set(contactIds)];
        }

        if (h.general.notEmpty(channel)) {
          const lineContactFollowers = await models.line_follower.findAll({
            where: {
              agency_channel_config_fk: channel,
              status: 'active',
            },
            attributes: ['contact_fk'],
          });
          contactIds = lineContactFollowers.map(
            ({ dataValues }) => dataValues.contact_fk,
          );
          contactIds = [...new Set(contactIds)];
        }

        if (contactIds) {
          // where.contact_id = { [Op.in]: contactIds };
          andClause = [
            ...andClause,
            {
              contact_id: { [Op.in]: contactIds },
            },
          ];
        }

        if (userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES) {
          andClause = [
            ...andClause,
            {
              [Op.or]: [
                { agency_user_fk: agency_user_id },
                { created_by: current_user_id },
              ],
            },
          ];
        }

        where = {
          [Op.and]: andClause,
        };

        const order = [
          ['permalink_sent_date', 'DESC'],
          ['created_date', 'DESC'],
          [models.contact_activity, 'created_date', 'DESC'],
        ];

        if (sortColumn && sortOrder) {
          const split = sortColumn.split('.');
          for (let i = 0; i < split.length; i++) {
            if (i !== split.length - 1) split[i] = models[split[i]];
          }
          order.unshift([...split, sortOrder]);
        }

        const include = [
          {
            model: models.agency_user,
            required: false,
            include: [
              {
                model: models.user,
                required: false,
              },
              {
                model: models.agency,
                required: false,
              },
            ],
          },
          {
            model: models.shortlisted_property,
            required: false,
            include: [
              {
                model: models.project_property,
                required: false,
              },
            ],
          },
          {
            model: models.contact_activity,
            required: false,
            where: {
              activity_type: constant.CONTACT.ACTIVITY.TYPE.BUYER_LINK_OPENED,
            },
          },
          {
            model: models.contact_property_values,
            where: wherePropertyValues,
            required: false,
            include: [
              {
                model: models.contact_property_definitions,
              },
            ],
          },
        ];

        let fetchTotalCountFn;
        if (totalCount) {
          fetchTotalCountFn = Promise.resolve(totalCount);
        } else {
          fetchTotalCountFn = contactController.count(where);
        }

        const [contactList, contactsCount] = await Promise.all([
          contactController.findAll(where, {
            offset,
            limit,
            include,
            order,
          }),
          fetchTotalCountFn,
        ]);

        contacts = contactList;

        const metadata = {
          pageCount: pageSize ? Math.ceil(contactsCount / limit) : undefined,
          pageIndex: pageIndex ? parseInt(pageIndex) : undefined,
          totalCount: contactsCount,
        };

        h.api.createResponse(
          request,
          response,
          200,
          { contacts, metadata },
          '1-contact-1621773084',
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
          '2-contact-1621773105',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/contact/current-user-contacts Get current user contacts list
   * @apiName StaffContactGetContacts
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/contact/current-user-contacts',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            contacts: { type: 'array' },
            metadata: {
              type: 'object',
              properties: {
                pageCount: { type: 'integer' },
                pageIndex: { type: 'integer' },
                totalCount: { type: 'integer' },
              },
            },
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
        const { agency_user_id, agency_fk } =
          await agencyUserController.findOne({ user_fk: user_id });
        const { pageSize, pageIndex, sortColumn, sortOrder } = request.query;
        const offset = pageIndex
          ? parseInt(pageIndex) * parseInt(pageSize)
          : undefined;
        const limit = pageSize ? parseInt(pageSize) : undefined;

        let contacts = [];
        const orClause = [];
        if (request.query.search && !h.general.isEmpty(request.query.search)) {
          const splitedQuery = request.query.search.split(' ');
          const firstNameQuery = splitedQuery[0];
          const lastNameQuery = splitedQuery[splitedQuery.length - 1];

          orClause.push(
            { first_name: { [Op.like]: `%${firstNameQuery}%` } },
            { last_name: { [Op.like]: `%${lastNameQuery}%` } },
            { mobile_number: { [Op.like]: `%${request.query.search}%` } },
            { email: { [Op.like]: `%${request.query.search}%` } },
          );
        }

        const where = h.notEmpty(orClause)
          ? {
              agency_user_fk: agency_user_id,
              status: constant.CONTACT.STATUS.ACTIVE,
              agency_fk,
              [Op.or]: orClause,
            }
          : {
              agency_user_fk: agency_user_id,
              status: constant.CONTACT.STATUS.ACTIVE,
              agency_fk,
            };

        const order = [
          ['permalink_sent_date', 'DESC'],
          ['created_date', 'DESC'],
          [models.contact_activity, 'created_date', 'DESC'],
        ];

        if (sortColumn && sortOrder) {
          const split = sortColumn.split('.');
          for (let i = 0; i < split.length; i++) {
            if (i !== split.length - 1) split[i] = models[split[i]];
          }
          order.unshift([...split, sortOrder]);
        }

        const contactsCount = await contactController.count(where, {});

        const metadata = {
          pageCount: pageSize ? Math.ceil(contactsCount / limit) : undefined,
          pageIndex: pageIndex ? parseInt(pageIndex) : undefined,
          totalCount: contactsCount,
        };

        contacts = await contactController.findAll(where, {
          offset,
          limit,
          include: [
            {
              model: models.agency_user,
              required: false,
              include: [
                {
                  model: models.user,
                  required: true,
                },
              ],
            },
            {
              model: models.shortlisted_property,
              required: false,
              include: [
                {
                  model: models.project_property,
                  required: false,
                },
              ],
            },
            {
              model: models.contact_activity,
              required: false,
              where: {
                activity_type: constant.CONTACT.ACTIVITY.TYPE.BUYER_LINK_OPENED,
              },
            },
          ],
          order,
        });

        h.api.createResponse(
          request,
          response,
          200,
          { contacts, metadata },
          '1-contact-1621773084',
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
          '2-contact-1621773105',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/contact/unassigned-contacts Get unassigned contacts list
   * @apiName StaffContactGetContacts
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/contact/unassigned-contacts',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            contacts: { type: 'array' },
            metadata: {
              type: 'object',
              properties: {
                pageCount: { type: 'integer' },
                pageIndex: { type: 'integer' },
                totalCount: { type: 'integer' },
              },
            },
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
        const { agency_fk } = await agencyUserController.findOne({
          user_fk: user_id,
        });
        const {
          pageSize = 25,
          pageIndex = 0,
          sortColumn,
          sortOrder,
          totalCount,
        } = request.query;
        const offset = pageIndex
          ? parseInt(pageIndex) * parseInt(pageSize)
          : undefined;
        const limit = pageSize ? parseInt(pageSize) : undefined;

        let contacts = [];
        const orClause = [];

        if (request.query.search && !h.general.isEmpty(request.query.search)) {
          const search = request.query.search;
          orClause.push(
            sequelize.where(
              sequelize.fn(
                'CONCAT',
                sequelize.col('contact.first_name'),
                ' ',
                sequelize.col('contact.last_name'),
              ),
              {
                [sequelize.Op.like]: `%${search.trim()}%`,
              },
            ),
            { mobile_number: { [Op.like]: `%${search.trim()}%` } },
            { email: { [Op.like]: `%${search.trim()}%` } },
          );
        }

        const where = h.notEmpty(orClause)
          ? {
              agency_fk,
              agency_user_fk: { [Op.or]: [null, ''] },
              [Op.or]: orClause,
            }
          : {
              agency_fk,
              agency_user_fk: { [Op.or]: [null, ''] },
            };

        console.log(where);
        if (
          request.query.leadStatus &&
          !h.general.isEmpty(request.query.leadStatus)
        ) {
          const leadStatus = request.query.leadStatus;
          const leadStatusArray = leadStatus.split(',');
          where.status = { [Op.or]: leadStatusArray };
        }

        const order = [
          ['permalink_sent_date', 'DESC'],
          ['created_date', 'DESC'],
          [models.contact_activity, 'created_date', 'DESC'],
        ];

        if (sortColumn && sortOrder) {
          const split = sortColumn.split('.');
          for (let i = 0; i < split.length; i++) {
            if (i !== split.length - 1) split[i] = models[split[i]];
          }
          order.unshift([...split, sortOrder]);
        }

        let getCountFn;
        if (totalCount) {
          getCountFn = Promise.resolve(totalCount);
        } else {
          getCountFn = contactController.count(where);
        }

        const [contactsList, contactsCount] = await Promise.all([
          contactController.findAll(where, {
            offset,
            limit,
            include: [
              {
                model: models.contact_activity,
                required: false,
                where: {
                  activity_type:
                    constant.CONTACT.ACTIVITY.TYPE.BUYER_LINK_OPENED,
                },
              },
            ],
            order,
          }),
          getCountFn,
        ]);

        contacts = contactsList;

        const metadata = {
          pageCount: pageSize ? Math.ceil(contactsCount / limit) : undefined,
          pageIndex: pageIndex ? parseInt(pageIndex) : undefined,
          totalCount: contactsCount,
        };

        h.api.createResponse(
          request,
          response,
          200,
          { contacts, metadata },
          '1-contact-1621773084',
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
          '2-contact-1621773105',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/contact/:contact_id Staff get single contact
   * @apiName StaffContactGetContact
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/contact/:contact_id',
    schema: {
      params: {
        type: 'object',
        required: ['contact_id'],
        properties: {
          contact_id: { type: 'string' },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      try {
        const { contact_id } = request.params;
        const { user_id: current_user_id } = h.user.getCurrentUser(request);
        const [{ agency_user_id, agency_fk }, userRoleRecord] =
          await Promise.all([
            agencyUserController.findOne({ user_fk: current_user_id }),
            userRoleController.findOne({
              user_fk: current_user_id,
            }),
          ]);

        let contact;
        const where = {
          contact_id,
          // status: constant.CONTACT.STATUS.ACTIVE,
          agency_fk,
        };

        if (userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES) {
          where[Op.or] = [
            { agency_user_fk: agency_user_id },
            { created_by: current_user_id },
          ];
        }

        contact = await contactController.findOne(where, {
          include: [
            {
              model: models.shortlisted_property,
              required: false,
              include: [
                {
                  model: models.contact,
                  required: false,
                  attributes: {
                    include: [
                      'contact_id',
                      'first_name',
                      'last_name',
                      'status',
                    ],
                  },
                  where: { agency_user_fk: agency_user_id },
                },
                {
                  model: models.project_property,
                  required: true,
                  where: { is_deleted: 0 },
                  include: [
                    { model: models.project, required: false },
                    {
                      model: models.project_media_property,
                      required: false,
                      include: [{ model: models.project_media }],
                    },
                  ],
                },
              ],
              where: { property_fk: null, is_deleted: 0 },
            },
            {
              model: models.shortlisted_project,
              where: { is_deleted: 0 },
              required: false,
              include: [
                {
                  model: models.contact,
                  required: false,
                  attributes: {
                    include: [
                      'contact_id',
                      'first_name',
                      'last_name',
                      'status',
                    ],
                  },
                  where: { agency_user_fk: agency_user_id },
                },
                {
                  model: models.project,
                  required: true,
                  where: { is_deleted: 0 },
                },
              ],
            },
          ],
        });

        if (!h.isEmpty(contact)) {
          contact = contact.toJSON();
          for (let i = 0; i < contact.shortlisted_properties.length; i++) {
            contact.shortlisted_properties[i].unit =
              projectPropertyController.formatProjectPropertyContent(
                contact.shortlisted_properties[i].project_property,
              );
          }
        }

        h.api.createResponse(
          request,
          response,
          200,
          { contact },
          '1-contact-1621773321',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to retrieve contact`, err);
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-contact-1621773339',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/contact/bulk-proposal',
    schema: {
      body: {
        type: 'object',
        required: ['contact_ids', 'proposal', 'agency_id', 'add_owner'],
        properties: {
          contact_ids: { type: 'array', items: { type: 'string' } },
          campaign_name: { type: 'string' },
          sms: { type: 'boolean' },
          whatsApp: { type: 'boolean' },
          email: { type: 'boolean' },
          proposal: { type: 'string' },
          agency_id: { type: 'string' },
          add_owner: { type: 'boolean' },
          trigger_quick_reply: { type: 'boolean' },
          trigger_add_image: { type: 'boolean' },
          selected_images: { type: 'array', items: { type: 'string' } },
          templates: { type: 'array' },
          is_generic: { type: 'boolean' },
          is_template: { type: 'boolean' },
          selected_waba_credentials_id: { type: 'string' },
          api_token: { type: 'string' },
          api_secret: { type: 'string' },
          permalink_template: { type: 'string' },
          cta_response: { type: 'array', items: { type: 'string' } },
          campaign_notification_additional_recipients: { type: 'string' },
          event_name: { type: 'string' },
          event_details: { type: 'string' },
          is_confirmation: { type: 'boolean' },
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
        const data = {
          ...request.body,
          user_id,
        };
        const result = await request.rabbitmq.pubBulkProposal({
          data,
          consumerType: constant.AMQ.CONSUMER_TYPES.PAVE_BULK_CREATE_PROPOSAL,
        });
        h.api.createResponse(
          request,
          response,
          200,
          { success: result },
          '1-create-bulk-proposal-1663834299369',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-create-bulk-proposal-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/contact/bulk-message',
    schema: {
      body: {
        type: 'object',
        required: ['contact_ids', 'agency_id', 'add_owner'],
        properties: {
          contact_ids: { type: 'array', items: { type: 'string' } },
          campaign_name: { type: 'string' },
          sms: { type: 'boolean' },
          whatsApp: { type: 'boolean' },
          email: { type: 'boolean' },
          proposal: { type: 'string' },
          agency_id: { type: 'string' },
          add_owner: { type: 'boolean' },
          trigger_quick_reply: { type: 'boolean' },
          trigger_add_image: { type: 'boolean' },
          selected_images: { type: 'array', items: { type: 'string' } },
          templates: { type: 'array' },
          is_generic: { type: 'boolean' },
          is_template: { type: 'boolean' },
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
        const data = {
          ...request.body,
          user_id,
        };
        const result = await request.rabbitmq.pubBulkMessage({
          data,
          consumerType: constant.AMQ.CONSUMER_TYPES.PAVE_BULK_CREATE_MESSAGE,
        });
        h.api.createResponse(
          request,
          response,
          200,
          { success: result },
          '1-create-bulk-proposal-1663834299369',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-create-bulk-proposal-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'PATCH',
    url: '/staff/contact/update-engagement-setting',
    schema: {
      body: {
        type: 'object',
        required: ['contact_id', 'engagements'],
        properties: {
          contact_ids: { type: 'string' },
          engagements: { type: 'array', items: { type: 'string' } },
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
        const { contact_id, engagements } = request.body;

        await h.database.transaction(async (transaction) => {
          await c.contact.update(
            contact_id,
            {
              whatsapp_engagement: engagements.join(','),
              updated_by: user_id,
            },
            { transaction },
          );
        });

        h.api.createResponse(
          request,
          response,
          200,
          { new_engagements: engagements.join(',') },
          'contact-1693362197-update-engagement-success',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(
          request,
          response,
          500,
          {},
          'contact-1693362197-update-engagement-failed',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'PUT',
    url: '/staff/contact/info-update',
    schema: {
      body: {
        type: 'object',
        required: ['contact_id'],
        properties: {
          contact_id: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          email: { type: 'string' },
          mobile_number: { type: 'string' },
          profile_picture_url: { type: 'string' },
          labels: { type: 'string' },
          status: { type: 'string' },
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
          first_name,
          last_name,
          email,
          mobile_number,
          labels,
          status,
        } = request.body;
        const { user_id } = h.user.getCurrentUser(request);

        const { updatedContactId } = await h.database.transaction(
          async (transaction) => {
            const updatedContactId = await contactController.update(
              contact_id,
              {
                first_name,
                last_name,
                email,
                mobile_number,
                labels,
                status,
                updated_by: user_id,
              },
              { transaction },
            );

            return { updatedContactId };
          },
        );

        h.api.createResponse(
          request,
          response,
          200,
          { contact_id: updatedContactId },
          '1-contact-1621772306',
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
          '2-contact-1621772321',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * Simple Search
   *
   */
  fastify.route({
    method: 'POST',
    url: '/staff/contact/search',
    schema: {
      body: {
        type: 'object',
        required: ['search', 'agency_id'],
        properties: {
          contact_id: { type: 'string' },
          agency_id: { type: 'string' },
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
        const [userRoleRecord, currentAgencyUser] = await Promise.all([
          userRoleController.findOne({
            user_fk: user_id,
          }),
          c.agencyUser.findOne({
            user_fk: user_id,
          }),
        ]);
        const { search, agency_id } = request.body;
        const orClause = [];
        if (!h.general.isEmpty(search)) {
          orClause.push(
            sequelize.where(
              sequelize.fn(
                'CONCAT',
                sequelize.col('contact.first_name'),
                ' ',
                sequelize.col('contact.last_name'),
              ),
              {
                [sequelize.Op.like]: `%${search.trim()}%`,
              },
            ),
            { mobile_number: { [Op.like]: `%${search.trim()}%` } },
            { email: { [Op.like]: `%${search.trim()}%` } },
          );
        }

        const contactWhere = {
          agency_fk: agency_id,
          status: {
            [Op.in]: ['active', 'outsider'],
          },
          mobile_number: {
            [Op.and]: {
              [Op.ne]: null, // Not null
              [Op.ne]: '', // Not empty
            },
          },
          [Op.or]: orClause,
        };

        const isAgencySalesUser =
          userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES;

        if (isAgencySalesUser) {
          contactWhere.agency_user_fk = currentAgencyUser.agency_user_id;
        }

        const contacts = await contactController.findAll(contactWhere, {
          include: [
            {
              model: models.agency_user,
              include: [
                {
                  model: models.user,
                },
              ],
            },
          ],
          limit: 50,
        });

        h.api.createResponse(
          request,
          response,
          200,
          { contacts },
          'contact-search-1692757100-retrieve-success',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(
          request,
          response,
          500,
          {},
          'contact-search-1692757100-retrieve-failed',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'PUT',
    url: '/staff/contact/line-contact-reassign',
    schema: {
      body: {
        type: 'object',
        required: ['contact_id', 'new_contact_id'],
        properties: {
          contact_id: { type: 'string' },
          new_contact_id: { type: 'string' },
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
        const { contact_id, new_contact_id } = request.body;
        const { user_id } = h.user.getCurrentUser(request);

        const { updatedContactId } = await h.database.transaction(
          async (transaction) => {
            const lineContact = await contactController.findOne(
              { contact_id },
              { transaction },
            );
            const updatedContactId = await contactController.update(
              new_contact_id,
              {
                line_user_id: lineContact?.line_user_id,
                opt_out_line: lineContact?.opt_out_line,
                opt_out_line_date: lineContact?.opt_out_line_date,
                status: 'active',
                updated_by: user_id,
              },
              { transaction },
            );

            await models.line_message_tracker.update(
              {
                contact_fk: new_contact_id,
              },
              { where: { contact_fk: contact_id }, transaction },
            );

            await models.line_chat.update(
              {
                contact_fk: new_contact_id,
              },
              { where: { contact_fk: contact_id }, transaction },
            );

            await models.unified_inbox.update(
              {
                contact_fk: new_contact_id,
              },
              {
                where: { contact_fk: contact_id, msg_platform: 'line' },
                transaction,
              },
            );

            await models.line_follower.update(
              {
                contact_fk: new_contact_id,
              },
              {
                where: { contact_fk: contact_id },
                transaction,
              },
            );

            await contactController.destroy({ contact_id }, { transaction });
            await contactSourceController.destroy(
              { contact_fk: contact_id, source_type: 'LINE' },
              { transaction },
            );

            const lineContactSource = await contactSourceController.findOne(
              { contact_fk: new_contact_id },
              { transaction },
            );

            if (h.isEmpty(lineContactSource)) {
              await contactSourceController.create(
                {
                  contact_fk: new_contact_id,
                  created_by: user_id,
                  source_type: 'webapp_admin',
                },
                { transaction },
              );
            }

            return { updatedContactId };
          },
        );

        h.api.createResponse(
          request,
          response,
          200,
          { contact_id: updatedContactId },
          '1-contact-1621772306',
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
          '2-contact-1621772321',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/contact/:contact_id/contact-salesforce-data Staff get single contact TEC Data
   * @apiName StaffContactGEtTECData
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */

  fastify.route({
    method: 'GET',
    url: '/staff/contact/:contact_id/contact-salesforce-data',
    schema: {
      params: {
        type: 'object',
        required: ['contact_id'],
        properties: {
          contact_id: { type: 'string' },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      try {
        const { contact_id } = request.params;
        const where = {
          contact_fk: contact_id,
        };

        const contact_saleforce_data = await c.contactSalesforceData.findOne(
          where,
          {
            order: [['created_date', 'DESC']],
          },
        );

        const languageArr = constant.LIVE_CHAT_LANGUAGE;

        if (h.notEmpty(contact_saleforce_data)) {
          if (h.notEmpty(contact_saleforce_data.language)) {
            const entered_language = contact_saleforce_data.language;
            contact_saleforce_data.language =
              languageArr[contact_saleforce_data.language];
            if (h.isEmpty(contact_saleforce_data.language)) {
              contact_saleforce_data.language = entered_language;
            }
          }
          if (h.notEmpty(contact_saleforce_data.interested_city)) {
            const cityDetails = await models.agency_salesforce_city.findOne({
              where: {
                agency_fk: contact_saleforce_data.agency_fk,
                code: contact_saleforce_data.interested_city,
                language: 'en',
              },
            });
            if (h.notEmpty(cityDetails)) {
              contact_saleforce_data.interested_city =
                cityDetails.dataValues.sf_city_id;
            }
          }
        }
        where.source_type = 'SALESFORCE';
        const contact_source = await c.contactSource.findOne(where, {});
        h.api.createResponse(
          request,
          response,
          200,
          {
            contact_saleforce_data,
            contact_source:
              h.notEmpty(contact_source) &&
              h.notEmpty(contact_source?.source_contact_id)
                ? contact_source
                : null,
          },
          '1-contact-1621773321',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${request.url}: failed to retrieve contact tec record`,
          err,
        );
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-contact-1621773339',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * Generate TEC Lead
   *
   */
  fastify.route({
    method: 'POST',
    url: '/staff/contact/generate-tec-lead',
    schema: {
      body: {
        type: 'object',
        required: [
          'agency_id',
          'agency_user_id',
          'contact_id',
          'first_name',
          'last_name',
          'mobile_number',
          'email',
          'platform',
          'preferred_language',
          'interested_product',
          'interested_city',
          'enable_marketing',
        ],
        properties: {
          agency_id: { type: 'string' },
          agency_user_id: { type: 'string' },
          contact_id: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          mobile_number: { type: 'string' },
          email: { type: 'string' },
          platform: { type: 'string' },
          preferred_language: { type: 'string' },
          interested_product: { type: 'string' },
          interested_city: { type: 'string' },
          enable_marketing: { type: 'boolean' },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      const {
        agency_id,
        agency_user_id,
        contact_id,
        first_name,
        last_name,
        mobile_number,
        email,
        platform,
        preferred_language,
        interested_product,
        interested_city,
        enable_marketing,
      } = request.body;
      const { user_id } = h.user.getCurrentUser(request);

      const transaction = await models.sequelize.transaction();
      try {
        const contactUpdateData = {
          email: email,
          updated_by: user_id,
        };
        let contact_sf_id;
        let city;
        const platform_selection = {
          whatsapp: 'WhatsApp',
          line: 'Line',
        };
        const tnCDate = new Date();
        const formattedTnCDate = tnCDate
          .toISOString()
          .slice(0, 19)
          .replace('T', ' ');
        const parsedDate = moment(formattedTnCDate, 'YYYY-MM-DD HH:mm:ss');
        const finalParsedDate = parsedDate.toDate();
        const marketing =
          h.notEmpty(enable_marketing) && h.cmpBool(enable_marketing, true);
        let contact_phone;
        let contact_phone_parts;
        let formatted_contact_phone;
        if (!h.isEmpty(mobile_number)) {
          contact_phone = mobile_number.replaceAll('+', '');
          contact_phone = contact_phone.replaceAll(' ', '');
          contact_phone = contact_phone.replaceAll('(', '');
          contact_phone = contact_phone.replaceAll(')', '');
          contact_phone = contact_phone.replaceAll('-', '');
          contact_phone = contact_phone.replaceAll('.', '');
          contact_phone_parts = h.mobile.getMobileParts(contact_phone);
          formatted_contact_phone =
            contact_phone_parts.countryCode +
            ' ' +
            contact_phone_parts.restOfNumber;
        }
        await contactController.update(contact_id, contactUpdateData, {
          transaction,
        });

        const liveChatSettings = await models.live_chat_settings.findOne({
          where: {
            agency_fk: agency_id,
          },
        });

        const contactSourceRecord = await models.contact_source.findOne({
          where: {
            contact_fk: contact_id,
            source_type: 'SALESFORCE',
          },
        });

        const hasOauth = !!(
          h.notEmpty(liveChatSettings.dataValues.api_oauth_url) &&
          h.notEmpty(liveChatSettings.dataValues.api_client_id) &&
          h.notEmpty(liveChatSettings.dataValues.api_client_secret)
        );
        const languageArr = constant.LIVE_CHAT_LANGUAGE;
        const language = !h.isEmpty(preferred_language)
          ? languageArr[preferred_language]
          : 'English';
        const tec_agencies = constant.TEC_AGENCIES;
        let cityDetails;
        const tec_data = {};
        const field_configurations = JSON.parse(
          liveChatSettings.dataValues.field_configuration,
        );
        const createData = {};
        let lead_source, lead_source_lv1, lead_source_lv2;
        const salesforceEnabledForPlatform = h.cmpStr(platform, 'whatsapp')
          ? liveChatSettings.dataValues.whatsapp_salesforce_enabled
          : liveChatSettings.dataValues.line_salesforce_enabled;

        if (h.cmpBool(salesforceEnabledForPlatform, true)) {
          console.log('salesforce enabled');
          console.log({
            agency_fk: agency_id,
            contact_fk: contact_id,
            first_name: first_name,
            last_name: last_name,
            mobile_number: formatted_contact_phone,
            email,
            mobile: mobile_number,
            language: preferred_language,
            interested_product,
            interested_city,
            enable_marketing,
            tnc_agree: true,
            created_by: user_id,
          });

          if (
            (h.cmpBool(hasOauth, true) ||
              h.notEmpty(liveChatSettings.dataValues.api_token)) &&
            h.notEmpty(liveChatSettings.dataValues.api_url)
          ) {
            const { ek: encryptionKeys } = request.ek;
            console.log('custom salesforce triggered');
            if (!h.isEmpty(interested_city)) {
              cityDetails = await models.agency_salesforce_city.findOne({
                where: {
                  agency_fk: agency_id,
                  sf_city_id: interested_city,
                  language: 'en',
                },
              });
              city = cityDetails.dataValues.code;
            }
            let token;
            const contact_fields = constant.CONTACT_FIELDS;
            if (h.isEmpty(liveChatSettings.dataValues.api_token) && hasOauth) {
              const decrypted_client_id = h.crypto.decrypt(
                {
                  encryptionKey: encryptionKeys.encryption_key,
                  encryptionIv: encryptionKeys.encryption_iv,
                },
                liveChatSettings.dataValues.api_client_id,
              );

              const decrypted_client_secret = h.crypto.decrypt(
                {
                  encryptionKey: encryptionKeys.encryption_key,
                  encryptionIv: encryptionKeys.encryption_iv,
                },
                liveChatSettings.dataValues.api_client_secret,
              );

              const requestInfo = new URLSearchParams();

              requestInfo.append('grant_type', 'client_credentials');
              requestInfo.append('client_id', decrypted_client_id);
              requestInfo.append('client_secret', decrypted_client_secret);

              const headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
              };

              const sfOauthResponse = await Axios.post(
                liveChatSettings.dataValues.api_oauth_url,
                requestInfo,
                {
                  headers,
                },
              );
              token = sfOauthResponse.data.access_token;
            } else {
              const decrypted_api_token = h.crypto.decrypt(
                {
                  encryptionKey: encryptionKeys.encryption_key,
                  encryptionIv: encryptionKeys.encryption_iv,
                },
                liveChatSettings.dataValues.api_token,
              );
              token = decrypted_api_token;
            }

            const endpoint_values = {
              first_name: first_name,
              last_name: last_name,
              email_address: email,
              mobile_number: formatted_contact_phone,
              product: interested_product,
              city: city,
              marketing: marketing,
              language: language,
              consent_date: finalParsedDate,
            };
            field_configurations.forEach((configuration) => {
              if (h.cmpBool(configuration.required, true)) {
                if (configuration.field in endpoint_values) {
                  createData[configuration.mappedTo] =
                    endpoint_values[configuration.field];
                } else {
                  if (h.notEmpty(configuration.defaultValue)) {
                    createData[configuration.mappedTo] =
                      configuration.defaultValue;
                    if (h.cmpStr(configuration.field, 'lead_source')) {
                      lead_source = configuration.defaultValue;
                    }
                    if (h.cmpStr(configuration.field, 'lead_channel')) {
                      lead_source_lv1 = configuration.defaultValue;
                    }
                    if (h.cmpStr(configuration.field, 'origin')) {
                      lead_source_lv2 = configuration.defaultValue;
                    }
                  } else {
                    if (h.cmpStr(configuration.field, 'lead_channel')) {
                      createData[configuration.mappedTo] =
                        platform_selection[platform];
                      lead_source_lv1 = platform_selection[platform];
                    }
                  }
                }
              }
            });

            console.log('sf_create_data', createData);

            const transmitChat =
              liveChatSettings.dataValues
                .salesforce_chat_logs_transmission_enabled;
            const commentField =
              liveChatSettings.dataValues
                .salesforce_chat_logs_transmission_field;

            if (h.cmpBool(transmitChat, true) && !h.isEmpty(commentField)) {
              if (platform === 'whatsapp') {
                const thread = await c.whatsappChat.findAll(
                  {
                    contact_fk: contact_id,
                  },
                  {
                    include: [
                      {
                        model: models.contact,
                        required: true,
                      },
                      {
                        model: models.agency_user,
                        required: true,
                        include: [
                          {
                            model: models.user,
                            required: true,
                          },
                        ],
                      },
                    ],
                    order: [['created_date', 'ASC']],
                  },
                );

                if (thread) {
                  thread.forEach((message) => {
                    console.log(message.msg_type);
                    let message_content;
                    let sender_name;
                    if (
                      ['text', 'image', 'video', 'document', 'button'].includes(
                        message.msg_type,
                      )
                    ) {
                      if (['text', 'button'].includes(message.msg_type)) {
                        message_content = message.msg_body + '\n-------------';
                      }
                      if (
                        ['image', 'document', 'video'].includes(
                          message.msg_type,
                        )
                      ) {
                        message_content = message.media_url + '\n-------------';
                      }
                      sender_name =
                        message.contact.first_name +
                        ' ' +
                        message.contact.last_name;
                      createData[
                        commentField
                      ] += `\n${sender_name}: ${message_content}`;
                    }

                    if (
                      [
                        'frompave',
                        'img_frompave',
                        'video_frompave',
                        'file_frompave',
                      ].includes(message.msg_type)
                    ) {
                      if (['frompave'].includes(message.msg_type)) {
                        const savedMessage = message.msg_body;

                        if (savedMessage.includes('test-class')) {
                          const portalMessage = savedMessage.split('</div>\n');
                          message_content = portalMessage[1];
                          message_content += '\n-------------';
                        } else {
                          message_content =
                            h.salesforce.sanitizeHTML(savedMessage);
                          message_content += '\n-------------';
                        }
                      }
                      if (
                        [
                          'img_frompave',
                          'file_frompave',
                          'video_frompave',
                        ].includes(message.msg_type)
                      ) {
                        const message_parts = message.msg_body.split(' ');
                        message_content = message_parts[0] + '\n-------------';
                      }
                      sender_name =
                        message.agency_user.user.first_name +
                        ' ' +
                        message.agency_user.user.last_name;
                      createData[
                        commentField
                      ] += `\n${sender_name}: ${message_content}`;
                    }
                  });
                }
              }
              if (platform === 'line') {
                const thread = await c.lineChat.findAll(
                  {
                    contact_fk: contact_id,
                  },
                  {
                    include: [
                      {
                        model: models.contact,
                        required: true,
                      },
                      {
                        model: models.agency_user,
                        required: true,
                        include: [
                          {
                            model: models.user,
                            required: true,
                          },
                        ],
                      },
                    ],
                    order: [['created_date', 'ASC']],
                  },
                );

                if (thread) {
                  thread.forEach((message) => {
                    console.log(message.msg_type);
                    let message_content;
                    let sender_name;
                    if (
                      ['text', 'image', 'video', 'document', 'button'].includes(
                        message.msg_type,
                      )
                    ) {
                      if (['text', 'button'].includes(message.msg_type)) {
                        message_content = message.msg_body + '\n-------------';
                      }
                      if (
                        ['image', 'document', 'video'].includes(
                          message.msg_type,
                        )
                      ) {
                        message_content = message.media_url + '\n-------------';
                      }
                      sender_name =
                        message.contact.first_name +
                        ' ' +
                        message.contact.last_name;
                      createData[
                        commentField
                      ] += `\n${sender_name}: ${message_content}`;
                    }

                    if (
                      [
                        'frompave',
                        'img_frompave',
                        'video_frompave',
                        'file_frompave',
                      ].includes(message.msg_type)
                    ) {
                      if (['frompave'].includes(message.msg_type)) {
                        const savedMessage = message.msg_body;

                        if (savedMessage.includes('test-class')) {
                          const portalMessage = savedMessage.split('</div>\n');
                          message_content = portalMessage[1];
                          message_content += '\n-------------';
                        } else {
                          message_content =
                            h.salesforce.sanitizeHTML(savedMessage);
                          message_content += '\n-------------';
                        }
                      }
                      if (
                        [
                          'img_frompave',
                          'file_frompave',
                          'video_frompave',
                        ].includes(message.msg_type)
                      ) {
                        const message_parts = message.msg_body.split(' ');
                        message_content = message_parts[0] + '\n-------------';
                      }
                      sender_name =
                        message.agency_user.user.first_name +
                        ' ' +
                        message.agency_user.user.last_name;
                      createData[
                        commentField
                      ] += `\n${sender_name}: ${message_content}`;
                    }
                  });
                }
              }
              createData[commentField] = h.salesforce.sanitizeHTML2(
                createData[commentField],
              );
            }
            console.log(contactSourceRecord);
            if (h.notEmpty(contactSourceRecord)) {
              console.log('update');
              createData[commentField] = null;
              const addSalesforceID =
                liveChatSettings.dataValues.add_salesforce_id;
              let update_url = `${liveChatSettings.dataValues.api_update_url}`;
              update_url = h.cmpBool(addSalesforceID, true)
                ? `${update_url}/${contactSourceRecord.dataValues.source_contact_id}`
                : update_url;
              const sfConfig = {
                method: 'put',
                url: `${update_url}`,
                headers: {
                  Authorization: `Basic ${token}`,
                  'Content-Type': 'application/json',
                },
                data: createData,
              };
              const sfResponse = await Axios(sfConfig)
                .then(function (response) {
                  return response.data;
                })
                .catch(function (error) {
                  Sentry.captureException(error);
                  return error;
                });
              console.log(sfResponse);
              contact_sf_id = contactSourceRecord.dataValues.source_contact_id;
            } else {
              console.log('create');
              const sfConfig = {
                method: 'post',
                url: `${liveChatSettings.dataValues.api_url}`,
                headers: {
                  Authorization: `Basic ${token}`,
                  'Content-Type': 'application/json',
                },
                data: createData,
              };
              const sfResponse = await Axios(sfConfig)
                .then(function (response) {
                  return response.data;
                })
                .catch(function (error) {
                  Sentry.captureException(error);
                  return error;
                });
              console.log(sfResponse);
              contact_sf_id = sfResponse.id;
            }
          } else {
            let agencyOauth = await models.agency_oauth.findOne({
              where: {
                agency_fk: agency_id,
                status: 'active',
                source: 'SALESFORCE',
              },
            });

            agencyOauth =
              agencyOauth && agencyOauth.toJSON
                ? agencyOauth.toJSON()
                : agencyOauth;

            if (!agencyOauth) {
              // finish execution here
              console.log({
                message: `No OAuth credentials`,
                processor: '/staff/contact/generate-tec-lead',
                agency_id,
              });
            } else {
              if (!h.isEmpty(interested_city)) {
                cityDetails = await models.agency_salesforce_city.findOne({
                  where: {
                    agency_fk: agency_id,
                    sf_city_id: interested_city,
                    language: 'en',
                  },
                });
                city = cityDetails.dataValues.code;
              }
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

              const creds = await new BPromise((resolve, reject) => {
                conn.oauth2.refreshToken(
                  refresh_token,
                  async (err, results) => {
                    if (err) {
                      console.log({
                        message: `Invalid credentials`,
                        processor: '/staff/contact/generate-tec-lead',
                        agency_id,
                      });

                      return resolve(null);
                    }
                    resolve(results);
                  },
                );
              });

              const salesforceObject =
                liveChatSettings.dataValues.salesforce_transmission_type;
              if (creds && !h.isEmpty(salesforceObject)) {
                const endpoint_values = {
                  first_name: first_name,
                  last_name: last_name,
                  email_address: email,
                  mobile_number: formatted_contact_phone,
                  product: interested_product,
                  city: city,
                  marketing: marketing,
                  language: language,
                  consent_date: finalParsedDate,
                };
                field_configurations.forEach((configuration) => {
                  if (h.cmpBool(configuration.required, true)) {
                    if (configuration.field in endpoint_values) {
                      createData[configuration.mappedTo] =
                        endpoint_values[configuration.field];
                    } else {
                      if (h.notEmpty(configuration.defaultValue)) {
                        createData[configuration.mappedTo] =
                          configuration.defaultValue;
                        if (h.cmpStr(configuration.field, 'lead_source')) {
                          lead_source = configuration.defaultValue;
                        }
                        if (h.cmpStr(configuration.field, 'lead_channel')) {
                          lead_source_lv1 = configuration.defaultValue;
                        }
                        if (h.cmpStr(configuration.field, 'origin')) {
                          lead_source_lv2 = configuration.defaultValue;
                        }
                      } else {
                        if (h.cmpStr(configuration.field, 'lead_channel')) {
                          createData[configuration.mappedTo] =
                            platform_selection[platform];
                          lead_source_lv1 = platform_selection[platform];
                        }
                      }
                    }
                  }
                });

                const transmitChat =
                  liveChatSettings.dataValues
                    .salesforce_chat_logs_transmission_enabled;
                const commentField =
                  liveChatSettings.dataValues
                    .salesforce_chat_logs_transmission_field;

                if (h.cmpBool(transmitChat, true) && !h.isEmpty(commentField)) {
                  if (platform === 'whatsapp') {
                    const thread = await c.whatsappChat.findAll(
                      {
                        contact_fk: contact_id,
                      },
                      {
                        include: [
                          {
                            model: models.contact,
                            required: true,
                          },
                          {
                            model: models.agency_user,
                            required: true,
                            include: [
                              {
                                model: models.user,
                                required: true,
                              },
                            ],
                          },
                        ],
                        order: [['created_date', 'ASC']],
                      },
                    );

                    if (thread) {
                      thread.forEach((message) => {
                        console.log(message.msg_type);
                        let message_content;
                        let sender_name;
                        if (
                          [
                            'text',
                            'image',
                            'video',
                            'document',
                            'button',
                          ].includes(message.msg_type)
                        ) {
                          if (['text', 'button'].includes(message.msg_type)) {
                            message_content =
                              message.msg_body + '\n-------------';
                          }
                          if (
                            ['image', 'document', 'video'].includes(
                              message.msg_type,
                            )
                          ) {
                            message_content =
                              message.media_url + '\n-------------';
                          }
                          sender_name =
                            message.contact.first_name +
                            ' ' +
                            message.contact.last_name;
                          createData[
                            commentField
                          ] += `\n${sender_name}: ${message_content}`;
                        }

                        if (
                          [
                            'frompave',
                            'img_frompave',
                            'video_frompave',
                            'file_frompave',
                          ].includes(message.msg_type)
                        ) {
                          if (['frompave'].includes(message.msg_type)) {
                            const savedMessage = message.msg_body;

                            if (savedMessage.includes('test-class')) {
                              const portalMessage =
                                savedMessage.split('</div>\n');
                              message_content = portalMessage[1];
                              message_content += '\n-------------';
                            } else {
                              message_content =
                                h.salesforce.sanitizeHTML(savedMessage);
                              message_content += '\n-------------';
                            }
                          }
                          if (
                            [
                              'img_frompave',
                              'file_frompave',
                              'video_frompave',
                            ].includes(message.msg_type)
                          ) {
                            const message_parts = message.msg_body.split(' ');
                            message_content =
                              message_parts[0] + '\n-------------';
                          }
                          sender_name =
                            message.agency_user.user.first_name +
                            ' ' +
                            message.agency_user.user.last_name;
                          createData[
                            commentField
                          ] += `\n${sender_name}: ${message_content}`;
                        }
                      });
                    }
                  }
                  if (platform === 'line') {
                    const thread = await c.lineChat.findAll(
                      {
                        contact_fk: contact_id,
                      },
                      {
                        include: [
                          {
                            model: models.contact,
                            required: true,
                          },
                          {
                            model: models.agency_user,
                            required: true,
                            include: [
                              {
                                model: models.user,
                                required: true,
                              },
                            ],
                          },
                        ],
                        order: [['created_date', 'ASC']],
                      },
                    );

                    if (thread) {
                      thread.forEach((message) => {
                        console.log(message.msg_type);
                        let message_content;
                        let sender_name;
                        if (
                          [
                            'text',
                            'image',
                            'video',
                            'document',
                            'button',
                          ].includes(message.msg_type)
                        ) {
                          if (['text', 'button'].includes(message.msg_type)) {
                            message_content =
                              message.msg_body + '\n-------------';
                          }
                          if (
                            ['image', 'document', 'video'].includes(
                              message.msg_type,
                            )
                          ) {
                            message_content =
                              message.media_url + '\n-------------';
                          }
                          sender_name =
                            message.contact.first_name +
                            ' ' +
                            message.contact.last_name;
                          createData[
                            commentField
                          ] += `\n${sender_name}: ${message_content}`;
                        }

                        if (
                          [
                            'frompave',
                            'img_frompave',
                            'video_frompave',
                            'file_frompave',
                          ].includes(message.msg_type)
                        ) {
                          if (['frompave'].includes(message.msg_type)) {
                            const savedMessage = message.msg_body;

                            if (savedMessage.includes('test-class')) {
                              const portalMessage =
                                savedMessage.split('</div>\n');
                              message_content = portalMessage[1];
                              message_content += '\n-------------';
                            } else {
                              message_content =
                                h.salesforce.sanitizeHTML(savedMessage);
                              message_content += '\n-------------';
                            }
                          }
                          if (
                            [
                              'img_frompave',
                              'file_frompave',
                              'video_frompave',
                            ].includes(message.msg_type)
                          ) {
                            const message_parts = message.msg_body.split(' ');
                            message_content =
                              message_parts[0] + '\n-------------';
                          }
                          sender_name =
                            message.agency_user.user.first_name +
                            ' ' +
                            message.agency_user.user.last_name;
                          createData[
                            commentField
                          ] += `\n${sender_name}: ${message_content}`;
                        }
                      });
                    }
                  }
                  createData[commentField] = h.salesforce.sanitizeHTML2(
                    createData[commentField],
                  );
                }

                if (h.notEmpty(contactSourceRecord)) {
                  createData[commentField] = null;
                  console.log('data', createData);
                  const updatedSFContact = await new BPromise(
                    (resolve, reject) => {
                      conn
                        .sobject(salesforceObject)
                        .update(createData, function (err, ret) {
                          if (err || !ret.success) {
                            console.log('update error', err);
                            resolve([]);
                          }
                          resolve(ret);
                        });
                    },
                  );
                  console.log('sfcontact process', updatedSFContact);
                  contact_sf_id = updatedSFContact.id;
                } else {
                  console.log('data', createData);
                  const createdSFContact = await new BPromise(
                    (resolve, reject) => {
                      conn
                        .sobject(salesforceObject)
                        .create(createData, function (err, ret) {
                          if (err || !ret.success) {
                            console.log(err);
                            resolve([]);
                          }
                          resolve(ret);
                        });
                    },
                  );
                  console.log('sfcontact process', createdSFContact);
                  contact_sf_id = createdSFContact.id;
                }
              }
            }
          }
        }

        if (!h.isEmpty(contact_sf_id)) {
          await c.contactSalesforceData.create(
            {
              agency_fk: agency_id,
              contact_fk: contact_id,
              first_name: first_name,
              last_name: last_name,
              mobile: formatted_contact_phone,
              email,
              language,
              interested_product,
              interested_city: city,
              lead_source: lead_source,
              lead_source_lv1: lead_source_lv1,
              lead_source_lv2: lead_source_lv2,
              enable_marketing,
              tnc_agree: true,
              tnc_date: finalParsedDate,
              created_by: user_id,
            },
            { transaction },
          );
          const dataID = await c.contactSource.create(
            {
              contact_fk: contact_id,
              source_contact_id: contact_sf_id,
              source_type: 'SALESFORCE',
            },
            { transaction },
          );
          console.log('source', dataID);

          const contact_note = `First Name: ${first_name}<br/>
                  Last Name: ${last_name}<br/>
                  Email: ${email}<br/>
                  Mobile: ${formatted_contact_phone}<br/>
                  Language: ${languageArr[preferred_language]}<br/>
                  Interested Product: ${interested_product}<br/>
                  Interested City: ${cityDetails.dataValues.name} (${
            cityDetails.dataValues.code
          })<br/>
                  Lead Source: ${lead_source}<br/>
                  Lead Channel: ${lead_source_lv1}<br/>
                  Origin: ${lead_source_lv2}<br/>
                  Marketing Enabled: ${
                    h.cmpBool(enable_marketing, true) ? 'Yes' : 'No'
                  }<br/>
                  TNC Agreed: ${finalParsedDate}`;
          const note_data = {
            contact_fk: contact_id,
            agency_user_fk: agency_user_id,
            note: contact_note,
          };
          try {
            const contactNoteData = await c.contactNoteCtlr.create(note_data, {
              transaction,
            });
            console.log('note', contactNoteData);
          } catch (err) {
            Sentry.captureException(err);
            console.log(err);
          }
        }
        transaction.commit();
        h.api.createResponse(
          request,
          response,
          200,
          {},
          '1-tec-sf-lead-1663834299369',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        transaction.rollback();
        h.api.createResponse(
          request,
          response,
          500,
          { err },
          '2-tec-sf-lead-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'PUT',
    url: '/staff/contact/salesforce-data/:contact_id',
    schema: {
      params: {
        type: 'object',
        required: ['contact_id'],
        properties: {
          contact_id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['field', 'value'],
        properties: {
          field: { type: 'string' },
          value: { type: 'string' },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      try {
        const { field, value } = request.body;
        const { contact_id } = request.params;
        const { user_id: current_user_id } = h.user.getCurrentUser(request);
        const { agency_user_id, agency_fk } =
          await agencyUserController.findOne({ user_fk: current_user_id });
        const contactSalesforceRecord = await c.contactSalesforceData.findOne(
          {
            agency_fk: agency_fk,
            contact_fk: contact_id,
          },
          {
            order: [['created_date', 'DESC']],
          },
        );

        const updateData = {};

        const languageArr = constant.LIVE_CHAT_LANGUAGE;
        if (h.cmpStr(field, 'preferred_language')) {
          contactSalesforceRecord.language = languageArr[value];
          updateData.language = value;
        } else if (h.cmpStr(field, 'interested_city')) {
          const cityDetails = await models.agency_salesforce_city.findOne({
            where: {
              agency_fk: agency_fk,
              sf_city_id: value,
              language: 'en',
            },
          });
          const city = cityDetails.dataValues.code;
          contactSalesforceRecord.interested_city = city;
          updateData.interested_city = city;
        } else if (h.cmpStr(field, 'email')) {
          updateData[field] = value;
          await contactController.update(contact_id, updateData);
        } else {
          updateData[field] = value;
        }

        contactSalesforceRecord[field] = value;
        updateData.updated_by = agency_user_id;
        await c.contactSalesforceData.update(
          contactSalesforceRecord.contact_salesforce_data_id,
          updateData,
        );

        const liveChatSettings = await c.liveChatSettings.findOne({
          agency_fk: agency_fk,
        });

        const agencyOauth = await c.agencyOauthCtlr.findOne({
          agency_fk: agency_fk,
          status: 'active',
          source: 'SALESFORCE',
        });

        const contactSource = await contactSourceController.findOne(
          {
            contact_fk: contact_id,
            source_type: 'SALESFORCE',
          },
          {
            order: [['created_date', 'DESC']],
          },
        );

        if (h.notEmpty(languageArr[contactSalesforceRecord.language])) {
          contactSalesforceRecord.language =
            languageArr[contactSalesforceRecord.language];
        }

        const interested_city = contactSalesforceRecord.interested_city;
        if (interested_city.length > 3) {
          const cityDetails = await models.agency_salesforce_city.findOne({
            where: {
              agency_fk: agency_fk,
              sf_city_id: interested_city,
              language: 'en',
            },
          });
          const city = cityDetails.dataValues.code;
          contactSalesforceRecord.interested_city = city;
        }

        const { ek: encryptionKeys } = request.ek;
        await h.salesforce.updateSalesforceRecord(
          liveChatSettings,
          contactSalesforceRecord,
          agencyOauth,
          contactSource,
          encryptionKeys,
        );

        const contact_note = `First Name: ${
          contactSalesforceRecord.first_name
        }<br/>
                  Last Name: ${contactSalesforceRecord.last_name}<br/>
                  Email: ${contactSalesforceRecord.email}<br/>
                  Mobile: ${
                    contactSalesforceRecord.formatted_contact_phone
                  }<br/>
                  Language: ${contactSalesforceRecord.language}<br/>
                  Interested Product: ${
                    contactSalesforceRecord.interested_product
                  }<br/>
                  Interested City: ${
                    contactSalesforceRecord.interested_city
                  }<br/>
                  Lead Source: ${contactSalesforceRecord.lead_source}<br/>
                  Lead Channel: ${contactSalesforceRecord.lead_source_lv1}<br/>
                  Origin: ${contactSalesforceRecord.lead_source_lv2}<br/>
                  Marketing Enabled: ${
                    h.cmpBool(contactSalesforceRecord.enable_marketing, true)
                      ? 'Yes'
                      : 'No'
                  }<br/>
                  TNC Agreed: ${contactSalesforceRecord.tnc_date}`;
        const note_data = {
          contact_fk: contact_id,
          agency_user_fk: agency_user_id,
          note: contact_note,
        };
        await c.contactNoteCtlr.create(note_data);

        h.api.createResponse(
          request,
          response,
          200,
          { contactSalesforceRecord },
          '1-contact-salesforce-update-1621773321',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to retrieve contact`, err);
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-contact-salesforce-update-1621773321',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {delete} /v1/staff/contact/bulk-archive Staff bulk archive contacts
   * @apiName StaffBulkContactArchive
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerError
   *
   * @apiParam {array} contact_ids List of selected contact IDs to be archived
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {array} contact_ids Archived contact IDs
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "contact_ids": Array
   * }
   */
  fastify.route({
    method: 'DELETE',
    url: '/staff/contact/bulk-archive',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      try {
        const { contact_ids } = request.body;
        const { user_id } = h.user.getCurrentUser(request);
        // do archive process
        const archivedContactIds = c.contact.archivedContacts(
          contact_ids,
          user_id,
        );
        h.api.createResponse(
          request,
          response,
          200,
          { contact_ids: archivedContactIds },
          '1-contact-archived-1652766684694',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${request.url}: user failed to archive selected contacts`,
          {
            err,
          },
        );
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-contact-archived-1652766684694',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/inactive-contact Find inactive contacts list
   * @apiName StaffContactFindInactiveContacts
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'POST',
    url: '/staff/contact/inactive-contacts',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            contacts: { type: 'array' },
            metadata: {
              type: 'object',
              properties: {
                pageCount: { type: 'integer' },
                pageIndex: { type: 'integer' },
                totalCount: { type: 'integer' },
              },
            },
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
        const { agency_user_id, agency_fk } =
          await agencyUserController.findOne({ user_fk: current_user_id });
        const userRoleRecord = await userRoleController.findOne({
          user_fk: current_user_id,
        });

        const {
          search,
          contactOwner,
          leadStatus,
          lastOpened,
          proposalSent,
          channel,
        } = request.body.setFilter;
        const moreFilter = request.body.moreFilter;
        const { pageSize, pageIndex, sortColumn, sortOrder, totalCount } =
          request.body.pagination;

        const offset = pageIndex
          ? parseInt(pageIndex) * parseInt(pageSize)
          : undefined;
        const limit = pageSize ? parseInt(pageSize) : undefined;

        let contacts = [];
        const orClause = [];
        let andClause = [];

        let where = {};

        if (!h.general.isEmpty(search)) {
          orClause.push(
            sequelize.where(
              sequelize.fn(
                'CONCAT',
                sequelize.col('contact.first_name'),
                ' ',
                sequelize.col('contact.last_name'),
              ),
              {
                [sequelize.Op.like]: `%${search.trim()}%`,
              },
            ),
            { mobile_number: { [Op.like]: `%${search.trim()}%` } },
            { email: { [Op.like]: `%${search.trim()}%` } },
          );
        }

        if (h.notEmpty(orClause)) {
          andClause = [
            ...andClause,
            {
              status: constant.CONTACT.STATUS.INACTIVE,
            },
            {
              agency_fk,
            },
            {
              [Op.or]: orClause,
            },
          ];
        } else {
          andClause = [
            ...andClause,
            {
              status: constant.CONTACT.STATUS.INACTIVE,
            },
            {
              agency_fk,
            },
          ];
        }

        if (
          !h.general.isEmpty(contactOwner) &&
          userRoleRecord.user_role !== constant.USER.ROLE.AGENCY_SALES
        ) {
          const contactOwnerArray = contactOwner.split(',');
          // where.agency_user_fk = { [Op.or]: contactOwnerArray };
          andClause.push({
            agency_user_fk: { [Op.or]: contactOwnerArray },
          });
        }

        if (!h.general.isEmpty(leadStatus)) {
          const leadStatusArray = leadStatus.split(',');
          // where.lead_status = { [Op.or]: leadStatusArray };
          andClause.push({
            lead_status: { [Op.or]: leadStatusArray },
          });
        }

        if (!h.general.isEmpty(lastOpened)) {
          const lastOpenedArray = lastOpened.split(',');
          const lastOpenedOrClauses = [];

          for (const lastOpened of lastOpenedArray) {
            const threshold = new Date(h.date.getSqlCurrentDate());
            for (const dateFilter in constant.DATE_FILTER) {
              if (lastOpened === constant.DATE_FILTER[dateFilter].VALUE) {
                threshold.setDate(
                  threshold.getDate() -
                    constant.DATE_FILTER[dateFilter].DAYS_THRESHOLD,
                );
              }
            }
            lastOpenedOrClauses.push({ [Op.gt]: threshold });
          }

          andClause = [
            ...andClause,
            {
              permalink_last_opened: { [Op.or]: lastOpenedOrClauses },
            },
          ];
        }

        if (!h.general.isEmpty(proposalSent)) {
          const proposalSentArray = proposalSent.split(',');
          const proposalSentOrClauses = [];

          for (const proposalSent of proposalSentArray) {
            const threshold = new Date(h.date.getSqlCurrentDate());
            for (const dateFilter in constant.DATE_FILTER) {
              if (proposalSent === constant.DATE_FILTER[dateFilter].VALUE) {
                threshold.setDate(
                  threshold.getDate() -
                    constant.DATE_FILTER[dateFilter].DAYS_THRESHOLD,
                );
              }
            }
            proposalSentOrClauses.push({ [Op.gt]: threshold });
          }

          andClause = [
            ...andClause,
            {
              permalink_sent_date: { [Op.or]: proposalSentOrClauses },
            },
          ];
        }

        let attributeStringArray = [];
        for (const key in moreFilter) {
          const genericFilterObject = moreFilter[key];
          if (genericFilterObject.attribute_type === 'string') {
            attributeStringArray = attributeStringArray.concat(
              genericFilterObject.attribute_value,
            );
          }
        }

        const wherePropertyValues = {};
        let contactIds;
        if (h.general.notEmpty(attributeStringArray)) {
          wherePropertyValues.attribute_value_string = attributeStringArray;
          const contactPropertyDefinitionsList =
            await models.contact_property_definitions.findAll({
              where: { agency_fk },
              attributes: ['contact_property_definition_id'],
            });
          const contactPropertyValuesList =
            await models.contact_property_values.findAll({
              where: {
                attribute_value_string: attributeStringArray,
                contact_property_definition_fk: {
                  [Op.in]: contactPropertyDefinitionsList.map(
                    ({ dataValues }) =>
                      dataValues.contact_property_definition_id,
                  ),
                },
              },
              attributes: ['contact_fk'],
            });
          contactIds = contactPropertyValuesList.map(
            ({ dataValues }) => dataValues.contact_fk,
          );
          contactIds = [...new Set(contactIds)];
        }

        if (h.general.notEmpty(channel)) {
          const lineContactFollowers = await models.line_follower.findAll({
            where: {
              agency_channel_config_fk: channel,
              status: 'active',
            },
            attributes: ['contact_fk'],
          });
          contactIds = lineContactFollowers.map(
            ({ dataValues }) => dataValues.contact_fk,
          );
          contactIds = [...new Set(contactIds)];
        }

        if (contactIds) {
          andClause = [
            ...andClause,
            {
              contact_id: { [Op.in]: contactIds },
            },
          ];
        }

        if (userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES) {
          andClause = [
            ...andClause,
            {
              [Op.or]: [
                { agency_user_fk: agency_user_id },
                { created_by: current_user_id },
              ],
            },
          ];
        }

        where = {
          [Op.and]: andClause,
        };

        const order = [
          ['permalink_sent_date', 'DESC'],
          ['created_date', 'DESC'],
          [models.contact_activity, 'created_date', 'DESC'],
        ];

        if (sortColumn && sortOrder) {
          const split = sortColumn.split('.');
          for (let i = 0; i < split.length; i++) {
            if (i !== split.length - 1) split[i] = models[split[i]];
          }
          order.unshift([...split, sortOrder]);
        }

        const include = [
          {
            model: models.agency_user,
            required: false,
            include: [
              {
                model: models.user,
                required: false,
              },
              {
                model: models.agency,
                required: false,
              },
            ],
          },
          {
            model: models.shortlisted_property,
            required: false,
            include: [
              {
                model: models.project_property,
                required: false,
              },
            ],
          },
          {
            model: models.contact_activity,
            required: false,
            where: {
              activity_type: constant.CONTACT.ACTIVITY.TYPE.BUYER_LINK_OPENED,
            },
          },
          {
            model: models.contact_property_values,
            where: wherePropertyValues,
            required: false,
            include: [
              {
                model: models.contact_property_definitions,
              },
            ],
          },
        ];

        let fetchTotalCountFn;
        if (totalCount) {
          fetchTotalCountFn = Promise.resolve(totalCount);
        } else {
          fetchTotalCountFn = contactController.count(where);
        }

        const [contactList, contactsCount] = await Promise.all([
          contactController.findAll(where, {
            offset,
            limit,
            include,
            order,
          }),
          fetchTotalCountFn,
        ]);

        contacts = contactList;

        const metadata = {
          pageCount: pageSize ? Math.ceil(contactsCount / limit) : undefined,
          pageIndex: pageIndex ? parseInt(pageIndex) : undefined,
          totalCount: contactsCount,
        };

        h.api.createResponse(
          request,
          response,
          200,
          { contacts, metadata },
          '1-contact-1621773084',
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
          '2-contact-1621773105',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/archived-contact Find archived contacts list
   * @apiName StaffContactFindArchivedContacts
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'POST',
    url: '/staff/contact/archived-contacts',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            contacts: { type: 'array' },
            metadata: {
              type: 'object',
              properties: {
                pageCount: { type: 'integer' },
                pageIndex: { type: 'integer' },
                totalCount: { type: 'integer' },
              },
            },
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
        const { agency_user_id, agency_fk } =
          await agencyUserController.findOne({ user_fk: current_user_id });
        const userRoleRecord = await userRoleController.findOne({
          user_fk: current_user_id,
        });

        const {
          search,
          contactOwner,
          leadStatus,
          lastOpened,
          proposalSent,
          channel,
        } = request.body.setFilter;
        const moreFilter = request.body.moreFilter;
        const { pageSize, pageIndex, sortColumn, sortOrder, totalCount } =
          request.body.pagination;

        const offset = pageIndex
          ? parseInt(pageIndex) * parseInt(pageSize)
          : undefined;
        const limit = pageSize ? parseInt(pageSize) : undefined;

        let contacts = [];
        const orClause = [];
        let andClause = [];

        let where = {};

        if (!h.general.isEmpty(search)) {
          orClause.push(
            sequelize.where(
              sequelize.fn(
                'CONCAT',
                sequelize.col('contact.first_name'),
                ' ',
                sequelize.col('contact.last_name'),
              ),
              {
                [sequelize.Op.like]: `%${search.trim()}%`,
              },
            ),
            { mobile_number: { [Op.like]: `%${search.trim()}%` } },
            { email: { [Op.like]: `%${search.trim()}%` } },
          );
        }

        if (h.notEmpty(orClause)) {
          andClause = [
            ...andClause,
            {
              status: constant.CONTACT.STATUS.ARCHIVED,
            },
            {
              agency_fk,
            },
            {
              [Op.or]: orClause,
            },
          ];
        } else {
          andClause = [
            ...andClause,
            {
              status: constant.CONTACT.STATUS.ARCHIVED,
            },
            {
              agency_fk,
            },
          ];
        }

        if (
          !h.general.isEmpty(contactOwner) &&
          userRoleRecord.user_role !== constant.USER.ROLE.AGENCY_SALES
        ) {
          const contactOwnerArray = contactOwner.split(',');
          // where.agency_user_fk = { [Op.or]: contactOwnerArray };
          andClause.push({
            agency_user_fk: { [Op.or]: contactOwnerArray },
          });
        }

        if (!h.general.isEmpty(leadStatus)) {
          const leadStatusArray = leadStatus.split(',');
          // where.lead_status = { [Op.or]: leadStatusArray };
          andClause.push({
            lead_status: { [Op.or]: leadStatusArray },
          });
        }

        if (!h.general.isEmpty(lastOpened)) {
          const lastOpenedArray = lastOpened.split(',');
          const lastOpenedOrClauses = [];

          for (const lastOpened of lastOpenedArray) {
            const threshold = new Date(h.date.getSqlCurrentDate());
            for (const dateFilter in constant.DATE_FILTER) {
              if (lastOpened === constant.DATE_FILTER[dateFilter].VALUE) {
                threshold.setDate(
                  threshold.getDate() -
                    constant.DATE_FILTER[dateFilter].DAYS_THRESHOLD,
                );
              }
            }
            lastOpenedOrClauses.push({ [Op.gt]: threshold });
          }

          andClause = [
            ...andClause,
            {
              permalink_last_opened: { [Op.or]: lastOpenedOrClauses },
            },
          ];
        }

        if (!h.general.isEmpty(proposalSent)) {
          const proposalSentArray = proposalSent.split(',');
          const proposalSentOrClauses = [];

          for (const proposalSent of proposalSentArray) {
            const threshold = new Date(h.date.getSqlCurrentDate());
            for (const dateFilter in constant.DATE_FILTER) {
              if (proposalSent === constant.DATE_FILTER[dateFilter].VALUE) {
                threshold.setDate(
                  threshold.getDate() -
                    constant.DATE_FILTER[dateFilter].DAYS_THRESHOLD,
                );
              }
            }
            proposalSentOrClauses.push({ [Op.gt]: threshold });
          }

          andClause = [
            ...andClause,
            {
              permalink_sent_date: { [Op.or]: proposalSentOrClauses },
            },
          ];
        }

        let attributeStringArray = [];
        for (const key in moreFilter) {
          const genericFilterObject = moreFilter[key];
          if (genericFilterObject.attribute_type === 'string') {
            attributeStringArray = attributeStringArray.concat(
              genericFilterObject.attribute_value,
            );
          }
        }

        const wherePropertyValues = {};
        let contactIds;
        if (h.general.notEmpty(attributeStringArray)) {
          wherePropertyValues.attribute_value_string = attributeStringArray;
          const contactPropertyDefinitionsList =
            await models.contact_property_definitions.findAll({
              where: { agency_fk },
              attributes: ['contact_property_definition_id'],
            });
          const contactPropertyValuesList =
            await models.contact_property_values.findAll({
              where: {
                attribute_value_string: attributeStringArray,
                contact_property_definition_fk: {
                  [Op.in]: contactPropertyDefinitionsList.map(
                    ({ dataValues }) =>
                      dataValues.contact_property_definition_id,
                  ),
                },
              },
              attributes: ['contact_fk'],
            });
          contactIds = contactPropertyValuesList.map(
            ({ dataValues }) => dataValues.contact_fk,
          );
          contactIds = [...new Set(contactIds)];
        }

        if (h.general.notEmpty(channel)) {
          const lineContactFollowers = await models.line_follower.findAll({
            where: {
              agency_channel_config_fk: channel,
              status: 'active',
            },
            attributes: ['contact_fk'],
          });
          contactIds = lineContactFollowers.map(
            ({ dataValues }) => dataValues.contact_fk,
          );
          contactIds = [...new Set(contactIds)];
        }

        if (contactIds) {
          andClause = [
            ...andClause,
            {
              contact_id: { [Op.in]: contactIds },
            },
          ];
        }

        if (userRoleRecord.user_role === constant.USER.ROLE.AGENCY_SALES) {
          andClause = [
            ...andClause,
            {
              [Op.or]: [
                { agency_user_fk: agency_user_id },
                { created_by: current_user_id },
              ],
            },
          ];
        }

        where = {
          [Op.and]: andClause,
        };

        const order = [
          ['permalink_sent_date', 'DESC'],
          ['created_date', 'DESC'],
          [models.contact_activity, 'created_date', 'DESC'],
        ];

        if (sortColumn && sortOrder) {
          const split = sortColumn.split('.');
          for (let i = 0; i < split.length; i++) {
            if (i !== split.length - 1) split[i] = models[split[i]];
          }
          order.unshift([...split, sortOrder]);
        }

        const include = [
          {
            model: models.agency_user,
            required: false,
            include: [
              {
                model: models.user,
                required: false,
              },
              {
                model: models.agency,
                required: false,
              },
            ],
          },
          {
            model: models.shortlisted_property,
            required: false,
            include: [
              {
                model: models.project_property,
                required: false,
              },
            ],
          },
          {
            model: models.contact_activity,
            required: false,
            where: {
              activity_type: constant.CONTACT.ACTIVITY.TYPE.BUYER_LINK_OPENED,
            },
          },
          {
            model: models.contact_property_values,
            where: wherePropertyValues,
            required: false,
            include: [
              {
                model: models.contact_property_definitions,
              },
            ],
          },
        ];

        let fetchTotalCountFn;
        if (totalCount) {
          fetchTotalCountFn = Promise.resolve(totalCount);
        } else {
          fetchTotalCountFn = contactController.count(where);
        }

        const [contactList, contactsCount] = await Promise.all([
          contactController.findAll(where, {
            offset,
            limit,
            include,
            order,
          }),
          fetchTotalCountFn,
        ]);

        contacts = contactList;

        const metadata = {
          pageCount: pageSize ? Math.ceil(contactsCount / limit) : undefined,
          pageIndex: pageIndex ? parseInt(pageIndex) : undefined,
          totalCount: contactsCount,
        };

        h.api.createResponse(
          request,
          response,
          200,
          { contacts, metadata },
          '1-contact-1621773084',
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
          '2-contact-1621773105',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'PUT',
    url: '/staff/contact/whatsapp-optout-update',
    schema: {
      body: {
        type: 'object',
        required: ['contact_id'],
        properties: {
          contact_id: { type: 'string' },
          opt_out_whatsapp: { type: 'boolean' },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      try {
        const { contact_id, opt_out_whatsapp } = request.body;
        const { user_id } = h.user.getCurrentUser(request);

        const opt_out_whatsapp_date = h.cmpBool(opt_out_whatsapp, true)
          ? new Date()
          : null;
        const { updatedContactId } = await h.database.transaction(
          async (transaction) => {
            const updatedContactId = await contactController.update(
              contact_id,
              {
                opt_out_whatsapp,
                opt_out_whatsapp_date,
                updated_by: user_id,
              },
              { transaction },
            );

            return { updatedContactId };
          },
        );
        const contact = await c.contact.findOne({
          contact_id: updatedContactId,
        });

        h.api.createResponse(
          request,
          response,
          200,
          {
            contact_id: updatedContactId,
            contact,
            opt_out_whatsapp,
            opt_out_whatsapp_date: contact?.opt_out_whatsapp_date,
          },
          '1-contact-1621772306',
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
          '2-contact-1621772321',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * Generate Salesforce record
   * This function creates a salesforce record using the generic SFDC configuration
   *
   */
  fastify.route({
    method: 'POST',
    url: '/staff/contact/generate-salesforce-record',
    schema: {
      body: {
        type: 'object',
        required: [
          'agency_id',
          'agency_user_id',
          'contact_id',
          'first_name',
          'last_name',
          'mobile_number',
          'email',
          'platform',
        ],
        properties: {
          agency_id: { type: 'string' },
          agency_user_id: { type: 'string' },
          contact_id: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          mobile_number: { type: 'string' },
          email: { type: 'string' },
          platform: { type: 'string' },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      const {
        agency_id,
        agency_user_id,
        contact_id,
        first_name,
        last_name,
        mobile_number,
        email,
        platform,
      } = request.body;
      const { user_id } = h.user.getCurrentUser(request);

      const transaction = await models.sequelize.transaction();
      try {
        const contactUpdateData = {
          email: email,
          updated_by: user_id,
        };
        const platform_selection = {
          whatsapp: 'WhatsApp',
          livechat: 'Live Chat',
          line: 'Line',
        };
        const tnCDate = new Date();
        const formattedTnCDate = tnCDate
          .toISOString()
          .slice(0, 19)
          .replace('T', ' ');
        const parsedDate = moment(formattedTnCDate, 'YYYY-MM-DD HH:mm:ss');
        const finalParsedDate = parsedDate.toDate();
        let contact_phone;
        if (!h.isEmpty(mobile_number)) {
          contact_phone = mobile_number.replaceAll('+', '');
          contact_phone = contact_phone.replaceAll(' ', '');
          contact_phone = contact_phone.replaceAll('(', '');
          contact_phone = contact_phone.replaceAll(')', '');
          contact_phone = contact_phone.replaceAll('-', '');
          contact_phone = contact_phone.replaceAll('.', '');
        }
        await contactController.update(contact_id, contactUpdateData, {
          transaction,
        });

        const liveChatSettings = await models.live_chat_settings.findOne({
          where: {
            agency_fk: agency_id,
          },
        });

        const contactSourceRecord = await models.contact_source.findOne({
          where: {
            contact_fk: contact_id,
            source_type: 'SALESFORCE',
          },
        });

        let contact_sf_id = null;
        const field_configurations = JSON.parse(
          liveChatSettings.dataValues.field_configuration,
        );
        const createData = {};
        let lead_source, lead_source_lv1, lead_source_lv2;
        const salesforceEnabledForPlatform = h.cmpStr(platform, 'whatsapp')
          ? liveChatSettings.dataValues.whatsapp_salesforce_enabled
          : liveChatSettings.dataValues.line_salesforce_enabled;

        if (h.cmpBool(salesforceEnabledForPlatform, true)) {
          console.log('salesforce enabled');
          console.log({
            agency_fk: agency_id,
            contact_fk: contact_id,
            first_name: first_name,
            last_name: last_name,
            mobile_number: contact_phone,
            email,
            mobile: mobile_number,
            created_by: user_id,
          });
          let agencyOauth = await models.agency_oauth.findOne({
            where: {
              agency_fk: agency_id,
              status: 'active',
              source: 'SALESFORCE',
            },
          });

          agencyOauth =
            agencyOauth && agencyOauth.toJSON
              ? agencyOauth.toJSON()
              : agencyOauth;

          if (!agencyOauth) {
            // finish execution here
            console.log({
              message: `No OAuth credentials`,
              processor: '/staff/contact/generate-salesforce-record',
              agency_id,
            });
          } else {
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

            const creds = await new BPromise((resolve, reject) => {
              conn.oauth2.refreshToken(refresh_token, async (err, results) => {
                if (err) {
                  console.log({
                    message: `Invalid credentials`,
                    processor: '/staff/contact/generate-salesforce-record',
                    agency_id,
                  });

                  return resolve(null);
                }
                resolve(results);
              });
            });

            const salesforceObject =
              liveChatSettings.dataValues.salesforce_transmission_type;
            console.log(creds, salesforceObject, liveChatSettings);
            if (creds && h.notEmpty(salesforceObject)) {
              const endpoint_values = {
                first_name: first_name,
                last_name: last_name,
                email_address: email,
                mobile_number: contact_phone,
                consent_date: finalParsedDate,
              };
              field_configurations.forEach((configuration) => {
                if (h.cmpBool(configuration.required, true)) {
                  if (configuration.field in endpoint_values) {
                    createData[configuration.mappedTo] =
                      endpoint_values[configuration.field] ?? '';
                  } else {
                    if (h.notEmpty(configuration.defaultValue)) {
                      createData[configuration.mappedTo] =
                        configuration.defaultValue ?? '';
                      if (h.cmpStr(configuration.field, 'lead_source')) {
                        lead_source = configuration.defaultValue;
                      }
                      if (h.cmpStr(configuration.field, 'lead_channel')) {
                        lead_source_lv1 = configuration.defaultValue;
                      }
                      if (h.cmpStr(configuration.field, 'origin')) {
                        lead_source_lv2 = configuration.defaultValue;
                      }
                    } else {
                      if (h.cmpStr(configuration.field, 'lead_channel')) {
                        createData[configuration.mappedTo] =
                          platform_selection[platform];
                        lead_source_lv1 = platform_selection[platform];
                      }
                    }
                  }
                }
              });

              const transmitChat =
                liveChatSettings.dataValues
                  .salesforce_chat_logs_transmission_enabled;
              const commentField =
                liveChatSettings.dataValues
                  .salesforce_chat_logs_transmission_field;

              console.log('conffiiiiiiiig', transmitChat, commentField);

              if (h.cmpBool(transmitChat, true) && h.notEmpty(commentField)) {
                if (platform === 'whatsapp') {
                  const thread = await c.whatsappChat.findAll(
                    {
                      contact_fk: contact_id,
                    },
                    {
                      include: [
                        {
                          model: models.contact,
                          required: true,
                        },
                        {
                          model: models.agency_user,
                          include: [
                            {
                              model: models.user,
                              required: true,
                            },
                          ],
                        },
                      ],
                      order: [['created_date', 'ASC']],
                    },
                  );

                  if (thread) {
                    thread.forEach((message) => {
                      console.log(message.msg_type);
                      let message_content;
                      let sender_name;
                      if (
                        [
                          'text',
                          'image',
                          'video',
                          'document',
                          'button',
                        ].includes(message.msg_type)
                      ) {
                        if (['text', 'button'].includes(message.msg_type)) {
                          message_content = h.general.unescapeData(
                            message.msg_body,
                          );
                          if (message.caption) {
                            message_content +=
                              '\n' +
                              h.general.unescapeData(message.caption) +
                              '\n';
                          }
                          message_content += '\n-------------';
                        }
                        if (
                          [
                            'image',
                            'document',
                            'video',
                            'audio',
                            'audio_file',
                            'audio',
                          ].includes(message.msg_type)
                        ) {
                          message_content = message.media_url;
                          if (message.caption) {
                            message_content +=
                              '\n' +
                              h.general.unescapeData(message.caption) +
                              '\n';
                          }
                          message_content += '\n-------------';
                        }
                        sender_name =
                          message.contact.first_name +
                          ' ' +
                          message.contact.last_name;
                        createData[
                          commentField
                        ] += `\n${sender_name}: ${message_content}`;
                      }

                      if (
                        [
                          'frompave',
                          'img_frompave',
                          'video_frompave',
                          'file_frompave',
                          'audio_frompave',
                        ].includes(message.msg_type)
                      ) {
                        if (['frompave'].includes(message.msg_type)) {
                          const savedMessage = h.general.unescapeData(
                            message.msg_body,
                          );

                          if (savedMessage.includes('test-class')) {
                            const portalMessage =
                              savedMessage.split('</div>\n');
                            message_content = h.general.unescapeData(
                              portalMessage[1],
                            );
                            if (message.caption) {
                              message_content +=
                                '\n' +
                                h.general.unescapeData(message.caption) +
                                '\n';
                            }
                            message_content += '\n-------------';
                          } else {
                            message_content =
                              h.general.unescapeData(savedMessage);
                            if (message.caption) {
                              message_content +=
                                '\n' +
                                h.general.unescapeData(message.caption) +
                                '\n';
                            }
                            message_content += '\n-------------';
                          }
                        }
                        if (
                          [
                            'img_frompave',
                            'file_frompave',
                            'video_frompave',
                            'audio_frompave',
                          ].includes(message.msg_type)
                        ) {
                          const message_parts = message.msg_body.split(' ');
                          message_content = h.general.unescapeData(
                            message_parts[0],
                          );
                          if (message.caption) {
                            message_content +=
                              '\n' +
                              h.general.unescapeData(message.caption) +
                              '\n';
                          }
                          message_content += '\n-------------';
                        }
                        sender_name =
                          message.agency_user.user.first_name +
                          ' ' +
                          message.agency_user.user.last_name;
                        createData[
                          commentField
                        ] += `\n${sender_name}: ${message_content}`;
                      }
                    });
                  }
                }
              }

              console.log(createData[commentField]);

              if (h.notEmpty(contactSourceRecord)) {
                createData[commentField] = '';
                console.log('data', createData);
                const updatedSFContact = await new BPromise(
                  (resolve, reject) => {
                    conn
                      .sobject(salesforceObject)
                      .update(createData, function (err, ret) {
                        if (err || !ret.success) {
                          console.log('update error', err);
                          resolve([]);
                        }
                        resolve(ret);
                      });
                  },
                );
                console.log('sfcontact process', updatedSFContact);
                contact_sf_id = updatedSFContact.id;
              } else {
                console.log('data', createData);
                const createdSFContact = await new BPromise(
                  (resolve, reject) => {
                    conn
                      .sobject(salesforceObject)
                      .create(createData, function (err, ret) {
                        if (err || !ret.success) {
                          console.log(err);
                          resolve([]);
                        }
                        resolve(ret);
                      });
                  },
                );
                console.log('sfcontact process', createdSFContact);
                contact_sf_id = createdSFContact.id;
              }
            }
          }
        }

        if (!h.isEmpty(contact_sf_id)) {
          await c.contactSalesforceData.create(
            {
              agency_fk: agency_id,
              contact_fk: contact_id,
              first_name: first_name,
              last_name: last_name,
              mobile: contact_phone,
              email,
              language: null,
              interested_product: null,
              interested_city: null,
              lead_source: lead_source,
              lead_source_lv1: lead_source_lv1,
              lead_source_lv2: lead_source_lv2,
              enable_marketing: null,
              tnc_agree: true,
              tnc_date: finalParsedDate,
              created_by: user_id,
            },
            { transaction },
          );
          const dataID = await c.contactSource.create(
            {
              contact_fk: contact_id,
              source_contact_id: contact_sf_id,
              source_type: 'SALESFORCE',
            },
            { transaction },
          );
          console.log('source', dataID);

          const contact_note = `First Name: ${first_name}<br/>
                  Last Name: ${last_name}<br/>
                  Email: ${email}<br/>
                  Mobile: ${contact_phone}<br/>
                  Creation date: ${finalParsedDate}`;
          const note_data = {
            contact_fk: contact_id,
            agency_user_fk: agency_user_id,
            note: contact_note,
          };
          try {
            const contactNoteData = await c.contactNoteCtlr.create(note_data, {
              transaction,
            });
            console.log('note', contactNoteData);
          } catch (err) {
            Sentry.captureException(err);
            console.log(err);
          }
        }
        await transaction.commit();
        return h.api.createResponse(
          request,
          response,
          200,
          {},
          '1-tec-sf-lead-1663834299369',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        await transaction.rollback();
        return h.api.createResponse(
          request,
          response,
          500,
          { err },
          '2-tec-sf-lead-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * Description
   * Get available hubspot contact list
   */
  fastify.route({
    method: 'POST',
    url: '/staff/contact/hubspot-contact-list',
    schema: {
      body: {
        type: 'object',
        required: ['agency_id'],
        properties: {
          agency_id: { type: 'string' },
          name: { type: 'string' },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      try {
        const { agency_id, name } = request.body;

        // get active agency oauth
        const agencyOauth = await c.agencyOauthCtlr.findOne(
          {
            agency_fk: agency_id,
            source: 'HUBSPOT',
            status: 'active',
          },
          {
            order: [['created_date', 'DESC']],
          },
        );

        const { oauthRefreshResponse, hubspotClient } =
          await h.hubspot.hubspotConnect({
            agencyOauth,
            log: request.log,
          });

        // if failed to connect, return error
        if (h.cmpBool(oauthRefreshResponse.success, false)) {
          return h.api.createResponse(
            request,
            response,
            500,
            {},
            '2-hubspot-contact-list-oauth-1663834299369',
            {
              portal,
            },
          );
        }

        // set retrieved access token
        hubspotClient.setAccessToken(oauthRefreshResponse.access_token);

        // prepare the query
        const ListSearchRequest = {
          listIds: [],
          offset: 0,
          count: 0,
          processingTypes: [],
          additionalProperties: ['string'],
          query: name,
        };

        // search available contact list based on query
        const listResponse = await hubspotClient.crm.lists.listsApi.doSearch(
          ListSearchRequest,
        );

        const list = listResponse.lists;

        const filteredLists = list.filter(
          (item) =>
            item.objectTypeId === '0-1' &&
            Number(item.additionalProperties.hs_list_size) > 0,
        );

        h.api.createResponse(
          request,
          response,
          200,
          { list: filteredLists },
          '1-hubspot-contact-list-1730254199',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        request.log.error(
          `${request.url}: user failed to fetch hubspot contact list`,
          {
            err,
          },
        );
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-hubspot-contact-list-1730254199',
          {
            portal,
          },
        );
      }
    },
  });

  next();
};
