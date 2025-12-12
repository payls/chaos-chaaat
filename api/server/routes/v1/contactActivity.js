const Sentry = require('@sentry/node');
const models = require('../../models');
const h = require('../../helpers');
const constant = require('../../constants/constant.json');
const geoip = require('geoip-lite');

const contactController =
  require('../../controllers/contact').makeContactController(models);

module.exports = (fastify, opts, next) => {
  const contactActivityController =
    require('../../controllers/contactActivity').makeContactActivityController(
      models,
      fastify,
    );
  /**
   * @api {post} /v1/contact/activity Create contact activity
   * @apiName ContactActivityCreate
   * @apiVersion 1.0.0
   * @apiGroup Contact Activity
   * @apiUse ServerError
   *
   * @apiParam {string} contact_fk Contact ID
   * @apiParam {string} activity_type Activity type
   * @apiParam {string} activity_meta Meta data
   * @apiParam {string} activity_date Date
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} contact_id Contact id.
   * @apiSuccess {string} shortlisted_property_id Short listed property id.
   * @apiSuccessExample {json} Success 200 Response:
   * {
   *      "status": "ok",
   *      "message": "Processed request successfully.",
   *      "message_code": "1-generic-001",
   *      "contact_activity_id": "1234",
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/contact/activity',
    schema: {
      body: {
        type: 'object',
        required: ['contact_fk', 'activity_type'],
        properties: {
          contact_fk: { type: 'string' },
          activity_type: { type: 'string' },
          activity_meta: { type: 'string' },
          activity_ip: { type: 'string' },
          viewed_on_device: { type: 'string' },
          activity_date: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            contact_activity_id: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const portal = h.request.getPortal(request);
      try {
        const { contact_fk, activity_type, activity_meta, activity_date } =
          request.body;

        console.log('request is', request.body);

        const previousContactValues = await contactController.findOne({
          contact_id: contact_fk,
        });

        const activity_ip = h.request.getIp(request);
        const view_on_device = h.notEmpty(request.headers['user-agent'])
          ? request.headers['user-agent']
          : '';

        const { contact_activity_id } = await h.database.transaction(
          async (transaction) => {
            const contact_activity_id = await contactActivityController.create(
              {
                contact_fk,
                activity_type,
                activity_meta,
                activity_ip: activity_ip,
                viewed_on_device: view_on_device,
                activity_date: activity_date || h.date.getSqlCurrentDate(),
                created_by: contact_fk,
              },
              { transaction },
            );
            if (
              activity_type === constant.CONTACT.ACTIVITY.TYPE.BUYER_LINK_OPENED
            ) {
              // proposal_opened state can only be reached from proposal_sent & proposal_created
              // updated_proposal_opened state can only be reached from updated_proposal_sent & updated_proposal_created
              let lead_status;
              const constantLeadStatus = constant.LEAD_STATUS;
              switch (previousContactValues.lead_status) {
                case constantLeadStatus.PROPOSAL_CREATED:
                case constantLeadStatus.PROPOSAL_SENT:
                  lead_status = constantLeadStatus.PROPOSAL_OPENED;
                  break;
                case constantLeadStatus.UPDATED_PROPOSAL_CREATED:
                case constantLeadStatus.UPDATED_PROPOSAL_SENT:
                  lead_status = constantLeadStatus.UPDATED_PROPOSAL_OPENED;
                  break;
                default:
                  lead_status = previousContactValues.lead_status;
                  console.log(
                    `Lead status is not changed when BUYER_LINK_OPENED, check the state transition logic.`,
                  );
              }

              // safety check for safe state transition
              h.leadStatus.validateStateChange(
                previousContactValues.lead_status,
                lead_status,
              );

              await contactController.update(
                contact_fk,
                {
                  lead_status: lead_status,
                  permalink_last_opened: h.date.getSqlCurrentDate(),
                },
                { transaction },
              );
            }
            await contactActivityController.calculateLeadScore(
              activity_type,
              activity_meta,
              contact_fk,
              { transaction },
            );

            // log the activity onto hubspot
            try {
              await contactActivityController.logActivityToHubSpot(
                {
                  contact_fk,
                  activity_type,
                  activity_meta,
                  activity_date: activity_date || h.date.getSqlCurrentDate(),
                  created_by: contact_fk,
                },
                { transaction },
                request,
              );
            } catch (err) {
              Sentry.captureException(err);
              console.log(`failed to log activity to hubspot: ${err}`);
            }

            try {
              await contactActivityController.logActivityToHubSpotDirect(
                {
                  contact_fk,
                  activity_type,
                  activity_meta,
                  activity_date: activity_date || h.date.getSqlCurrentDate(),
                  created_by: contact_fk,
                },
                { transaction },
                request,
              );
            } catch (err) {
              Sentry.captureException(err);
              console.log(`failed to log activity to hubspot Direct: ${err}`);
            }

            // log the activity onto salesforce
            console.log('Logging Salesforce meta now', activity_meta);
            try {
              await contactActivityController.logActivityToSalesforce(
                {
                  contact_fk,
                  activity_type,
                  activity_meta,
                  activity_date: activity_date || h.date.getSqlCurrentDate(),
                  created_by: contact_fk,
                },
                { transaction },
                request,
              );
            } catch (err) {
              Sentry.captureException(err);
              console.log(`failed to log activity to Salesforce: ${err}`);
            }

            try {
              await contactActivityController.logActivityToSalesforceDirectIntegration(
                {
                  contact_fk,
                  activity_type,
                  activity_meta,
                  activity_date: activity_date || h.date.getSqlCurrentDate(),
                  created_by: contact_fk,
                },
                { transaction },
                request,
              );
            } catch (err) {
              Sentry.captureException(err);
              console.log(
                `failed to log activity to Salesforce Direct: ${err}`,
              );
            }

            return { contact_activity_id };
          },
        );

        // check if has message tracker
        const message_tracker = await models.whatsapp_message_tracker.findOne({
          where: {
            tracker_type: 'main',
            contact_fk: contact_fk,
          },
          order: [['created_date', 'ASC']],
        });

        // check cta record
        const cta_record = message_tracker?.tracker_ref_name
          ? await models.campaign_cta.findOne({
              where: {
                campaign_tracker_ref_name: message_tracker?.tracker_ref_name,
              },
            })
          : null;

        const additional_email_recipient =
          cta_record?.campaign_notification_additional_recipients
            ? cta_record?.campaign_notification_additional_recipients
            : null;

        // notify the agent of the new activity
        try {
          await contactActivityController.notifyActivityToAgent(
            additional_email_recipient,
            previousContactValues,
            activity_type,
            activity_meta,
            contact_activity_id,
          );
        } catch (err) {
          Sentry.captureException(err);
          console.log(
            `Failed to send email notification to agent regarding the activity: ${err}`,
          );
        }

        h.api.createResponse(
          request,
          reply,
          200,
          { contact_activity_id },
          '1-contact-activity-1623812368',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to create contact activity.`, {
          err,
        });
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-contact-activity-1623812377',
          {
            portal,
          },
        );
      }
    },
  });

  next();
};
