const Sentry = require('@sentry/node');
const MindBodyAPI = require('../../../services/mindBodyApi');
const c = require('../../../controllers');
const h = require('../../../helpers');
const models = require('../../../models');
const constant = require('../../../constants/constant.json');
const moment = require('moment');
const { Op } = require('sequelize');

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'POST',
    url: '/services/mindbody-webhook',

    handler: async (request, reply) => {
      const eventLog = {
        paveData: {},
      };
      const eventResponse = request.body;
      const {
        messageId,
        eventId,
        eventInstanceOriginationDateTime,
        eventData,
      } = eventResponse;

      const { ek: encryptionKeys } = request.ek;

      try {
        const { siteId } = eventData;
        // check agencyOauth record for active mindbody where access_info contains the siteId
        const agencyOAuthData = await c.agencyOauthCtlr.findOne({
          source: 'MINDBODY',
          status: 'active',
          access_info: {
            [Op.like]: `%"siteId":"${siteId}"%`,
          },
        });

        // get agencyId associated with the webhook payload
        const agencyId = h.notEmpty(agencyOAuthData)
          ? agencyOAuthData?.agency_fk
          : null;

        request.log.info({
          process_id: '001-mindbody-webhook',
          process: 'MINDBODY_WEBHOOK',
          url: '/services/mindbody-webhook',
          query_data: request.query,
          agency_id: agencyId,
          payload: eventResponse,
        });

        /**
         * Description
         * if no active agency is found for the given siteId, kill process
         * as we are not processing webhook payload for inactive mindbody config
         */
        if (h.isEmpty(agencyId)) {
          request.log.info({
            process_id: '002-mindbody-webhook',
            process: 'MINDBODY_WEBHOOK',
            url: '/services/mindbody-webhook',
            resut: 'No Agency found',
            message: `No OAuth details found for MindBody agency with siteId ${siteId}`,
            payload: eventResponse,
          });
          return true;
        }

        switch (eventId) {
          // Appointment
          case 'appointmentBooking.created':
            break;
          case 'appointmentBooking.updated': {
            const { clientId, hasArrived } = eventData;
            const source = await c.contactSource.findOne({
              source_contact_id: clientId,
            });

            if (h.isEmpty(source)) {
              await c.automationCtlr.updateMindbodyVisit(
                agencyId,
                source.contact_fk,
                clientId,
              );

              if (hasArrived) {
                await c.automationCtlr.messageClientAttendedFirstBooking(
                  clientId,
                  eventData,
                  agencyId,
                  encryptionKeys,
                );
              }
            }
            break;
          }
          // Client
          case 'client.created': {
            let agency_user_fk = '';
            const { clientId, firstName, lastName, email, mobilePhone } =
              eventData;

            // check contact record with mobile_number under agency
            const contact = await c.contact.findOne({
              agency_fk: agencyId,
              mobile_number: mobilePhone,
            });

            const agency = await c.agency.findOne({
              agency_id: agencyId,
            });

            if (
              h.general.notEmpty(agency) &&
              h.general.notEmpty(agency.default_outsider_contact_owner)
            ) {
              agency_user_fk = agency.default_outsider_contact_owner;
            } else {
              const agencySupport = await c.agencyUser.findOne(
                {
                  agency_fk: agencyId,
                },
                {
                  include: [
                    {
                      model: models.user,
                      required: true,
                      where: { email: { [Op.like]: `%support+%` } },
                    },
                  ],
                },
              );

              if (h.general.notEmpty(agencySupport)) {
                agency_user_fk = agencySupport.agency_user_id;
              }
            }

            if (h.general.isEmpty(contact) && h.general.notEmpty(email)) {
              const contactInventory = await c.contact.checkIfCanAddNewContact(
                agencyId,
              );
              if (h.cmpBool(contactInventory.can_continue, false)) {
                request.log.warn({
                  message: h.general.getMessageByCode(contactInventory.reason),
                  details: eventData,
                });
                eventLog.msg = h.general.getMessageByCode(
                  contactInventory.reason,
                );
                // to add email notification for contact iventory fail
              } else {
                const { contact_id, contact_source_id } =
                  await h.database.transaction(async (transaction) => {
                    // Create contact record
                    const contact_id = await c.contact.create(
                      {
                        first_name: firstName,
                        last_name: lastName,
                        email,
                        mobile_number: mobilePhone,
                        agency_fk: agencyId,
                        status: constant.CONTACT.STATUS.ACTIVE,
                        agency_user_fk,
                      },
                      { transaction },
                    );

                    // Create contact_source_record
                    const contact_source_id = await c.contactSource.create(
                      {
                        contact_fk: contact_id,
                        source_contact_id: clientId,
                        source_type:
                          constant.DIRECT_INTEGRATION.SOURCE_TYPE.MINDBODY,
                        source_original_payload: JSON.stringify(eventData),
                      },
                      { transaction },
                    );

                    return { contact_id, contact_source_id };
                  });
                await c.agencyNotification.checkContactCapacityAfterUpdate(
                  agencyId,
                );
                eventLog.paveData = { contact_id, contact_source_id };
              }
            } else {
              eventLog.msg = 'Contact already existed';
            }

            break;
          }
          case 'client.updated': {
            const { clientId, firstName, lastName, email, mobilePhone } =
              eventData;

            const source = await c.contactSource.findOne({
              source_contact_id: clientId,
            });

            if (!h.general.isEmpty(source)) {
              const contact = await c.contact.findOne({
                contact_id: source.contact_fk,
                agency_fk: agencyId,
              });
              if (!h.general.isEmpty(contact)) {
                const contact_latest_msg = await c.whatsappChat.findOne(
                  {
                    contact_fk: contact.contact_id,
                    receiver_number: { [Op.ne]: null },
                  },
                  {
                    order: [['created_date', 'DESC']],
                  },
                );
                let contact_mobile_number = mobilePhone;
                if (!h.isEmpty(contact_latest_msg)) {
                  contact_mobile_number = contact_latest_msg.receiver_number;
                }
                await c.contact.update(contact.contact_id, {
                  first_name: firstName,
                  last_name: lastName,
                  email,
                  mobile_number: contact_mobile_number,
                });
                await c.automationCtlr.updateMindbodyContact(
                  agencyId,
                  source.contact_fk,
                  clientId,
                );
              }
            }
            break;
          }
          case 'client.deactivated':
            /**
             * @TODO
             * Update mindbody association
             */

            break;

          // Membership / Packages
          case 'clientMembershipAssignment.created':
            {
              const { clientId, clientFirstName, clientLastName, clientEmail } =
                eventData;

              const source = await c.contactSource.findOne({
                source_contact_id: clientId,
              });

              const contact = await c.contact.findOne({
                email: clientEmail,
              });

              if (h.general.isEmpty(source) && h.general.isEmpty(contact)) {
                let agency_user_fk = '';

                const agency = await c.agency.findOne({
                  agency_id: agencyId,
                });

                if (
                  h.general.notEmpty(agency) &&
                  h.general.notEmpty(agency.default_outsider_contact_owner)
                ) {
                  agency_user_fk = agency.default_outsider_contact_owner;
                } else {
                  const agencySupport = await c.agencyUser.findOne(
                    {
                      agency_fk: agencyId,
                    },
                    {
                      include: [
                        {
                          model: models.user,
                          required: true,
                          where: { email: { [Op.like]: `%support+%` } },
                        },
                      ],
                    },
                  );

                  if (h.general.notEmpty(agencySupport)) {
                    agency_user_fk = agencySupport.agency_user_id;
                  }
                }

                // check contact inventory
                const contactInventory =
                  await c.contact.checkIfCanAddNewContact(agencyId);
                if (h.cmpBool(contactInventory.can_continue, false)) {
                  request.log.warn({
                    message: h.general.getMessageByCode(
                      contactInventory.reason,
                    ),
                    details: eventData,
                  });
                  eventLog.msg = h.general.getMessageByCode(
                    contactInventory.reason,
                  );
                  // to add email notification for contact iventory fail
                } else {
                  const { contact_id, contact_source_id } =
                    await h.database.transaction(async (transaction) => {
                      // Create contact record
                      const contact_id = await c.contact.create(
                        {
                          first_name: clientFirstName,
                          last_name: clientLastName,
                          email: clientEmail,
                          mobile_number: '',
                          agency_fk: agencyId,
                          status: constant.CONTACT.STATUS.ACTIVE,
                          agency_user_fk,
                        },
                        { transaction },
                      );

                      // Create contact_source_record
                      const contact_source_id = await c.contactSource.create(
                        {
                          contact_fk: contact_id,
                          source_contact_id: clientId,
                          source_type:
                            constant.DIRECT_INTEGRATION.SOURCE_TYPE.MINDBODY,
                          source_original_payload: JSON.stringify(eventData),
                        },
                        { transaction },
                      );

                      return { contact_id, contact_source_id };
                    });
                  await c.agencyNotification.checkContactCapacityAfterUpdate(
                    agencyId,
                  );
                  await c.automationCtlr.updateMindbodyContact(
                    agencyId,
                    contact_id,
                    clientId,
                  );
                }
              }

              if (h.general.notEmpty(contact)) {
                await c.automationCtlr.updateMindbodyContact(
                  agencyId,
                  source.contact_fk,
                  clientId,
                );
              }

              await c.automationRule.findAll(
                {
                  status: 'active',
                  rule_trigger_fk: 'da7875aa-7e42-4260-8941-02ba9b90e0e4',
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
                    },
                  ],
                },
              );
            }

            break;

          case 'clientSale.created':
            {
              const { purchasingClientId } = eventData;

              const source = await c.contactSource.findOne({
                source_contact_id: purchasingClientId,
              });

              if (!h.general.isEmpty(source)) {
                await c.contact.findOne({
                  contact_id: source.contact_fk,
                });

                await c.automationCtlr.updateMindbodyContact(
                  agencyId,
                  source.contact_fk,
                  purchasingClientId,
                );
              }
            }
            break;

          case 'clientContract.created':
          case 'clientContract.updated': {
            const { clientId } = eventData;

            const source = await c.contactSource.findOne({
              source_contact_id: clientId,
            });

            if (!h.general.isEmpty(source)) {
              await c.contact.findOne({
                contact_id: source.contact_fk,
              });

              await c.automationCtlr.updateMindbodyContact(
                agencyId,
                source.contact_fk,
                clientId,
              );
            }

            break;
          }

          // Client Booking
          case 'classRosterBooking.created': {
            const { clientId } = eventData;
            const source = await c.contactSource.findOne({
              source_contact_id: clientId,
            });
            if (!h.isEmpty(source)) {
              await c.automationCtlr.updateMindbodyVisit(
                agencyId,
                source.contact_fk,
                clientId,
              );

              await c.automationCtlr.messageClientForFirstBooking(
                clientId,
                eventData,
                agencyId,
                encryptionKeys,
              );
            }

            break;
          }

          // Client Booking
          case 'classRosterBookingStatus.updated': {
            const { clientId } = eventData;
            const source = await c.contactSource.findOne({
              source_contact_id: clientId,
            });

            await c.automationCtlr.updateMindbodyVisit(
              agencyId,
              source.contact_fk,
              clientId,
            );
            break;
          }

          case 'classRosterBooking.cancelled': {
            const { classRosterBookingId } = eventData;
            await h.database.transaction(async (transaction) => {
              await c.mindBodyClientVisit.destroyAll(
                {
                  payload: {
                    [Op.like]: `%"Id":${classRosterBookingId}%`,
                  },
                },
                {
                  transaction,
                },
              );
            });

            break;
          }

          default:
            break;
        }

        return {
          agencyId,
          eventLog,
          eventResponse,
        };
      } catch (err) {
        Sentry.captureException(err);
        return {
          success: false,
          message: err,
        };
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/services/mindbody-webhook',

    handler: async (request, reply) => {
      const body = request.body;
      try {
        return {
          success: body,
        };
      } catch (err) {
        Sentry.captureException(err);
        return {
          success: false,
          message: err,
        };
      }
    },
  });

  fastify.route({
    method: 'HEAD',
    url: '/services/mindbody-webhook',

    handler: async (request, reply) => {
      const body = request.body;
      try {
        return {
          success: body,
        };
      } catch (err) {
        Sentry.captureException(err);
        return {
          success: false,
          message: err,
        };
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/services/mindbody-update-packages',

    handler: async () => {
      try {
        await c.mindBodyPackage.syncPackages();

        return {
          success: true,
        };
      } catch (err) {
        Sentry.captureException(err);
        return {
          success: false,
          message: JSON.stringify(err),
        };
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/services/mindbody-update-contact',

    handler: async (request, reply) => {
      const { agencyId, contact_fk, clientId } = request.query;

      try {
        await c.automationCtlr.updateMindbodyContact(
          agencyId,
          contact_fk,
          clientId,
        );

        return {
          success: true,
        };
      } catch (err) {
        Sentry.captureException(err);
        return {
          success: false,
          message: JSON.stringify(err),
        };
      }
    },
  });

  next();
};
