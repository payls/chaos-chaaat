const h = require('../../../../helpers');
const constant = require('../../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const trayMiddleware = require('../../../../middlewares/tray');
const c = require('../../../../controllers');

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/staff/integrations/webhook/sync-all-hubspot-contacts Sync All HubSpot Contacts
   * @apiName StaffIntegrationsHubSpotSyncAllHubSpotContacts
   * @apiVersion 1.0.0
   * @apiGroup StaffIntegrationsHubSpot
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'POST',
    url: '/staff/integrations/webhook/sync-all-hubspot-contacts',
    preValidation: async (request, reply) => {
      // No prevalidation here since this end point is called by tray webhook
      await trayMiddleware.isValidTrayRequest(request, reply);
    },
    handler: async (req, res) => {
      try {
        const hubspot_contact_list_full_sync = req.body;
        if (hubspot_contact_list_full_sync.paginated) {
          const { agency_user } = hubspot_contact_list_full_sync;
          console.log('Multiple Pages present. Starting Full Sync now....');
          const { contacts, contact_owners } = hubspot_contact_list_full_sync;
          await Promise.all(
            contacts.contact_list
              .filter((page) => page.value && Array.isArray(page.value))
              .map((page) => {
                return Promise.all(
                  page.value.map((eachContact) => {
                    const currentContactOwner = contact_owners.find((owner) =>
                      h.cmpStr(
                        owner.id,
                        eachContact.properties.hubspot_owner_id,
                      ),
                    );
                    return c.hubspot.addContactToPave({
                      contact: eachContact,
                      contact_owner: currentContactOwner,
                      agency_user,
                    });
                  }),
                );
              }),
          );
        } else {
          // Get Agency User and Agency User Details
          const { agency_user, contacts, contact_owners } =
            hubspot_contact_list_full_sync;
          let currentContactOwner = {};
          await Promise.all(
            contacts.map(async (eachContact) => {
              contact_owners.forEach((owner) => {
                if (
                  h.cmpStr(owner.id, eachContact.properties.hubspot_owner_id)
                ) {
                  currentContactOwner = owner;
                }
              });
              const payload = {
                contact: eachContact,
                contact_owner: currentContactOwner,
                agency_user,
              };
              await c.hubspot.addContactToPave(payload);
            }),
          );
        }
        h.api.createResponse(
          res,
          200,
          { success: true },
          '1-tray-contact-1634121378394',
          { portal },
        );
      } catch (err) {
        console.log(err);
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-tray-contact-1634121378394',
          { portal },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/integrations/webhook/sync-all-salesforce-contacts Sync All Salesforce Contacts
   * @apiName StaffIntegrationsSalesforceSyncAllSalesforceContacts
   * @apiVersion 1.0.0
   * @apiGroup StaffIntegrationsSalesforce
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'POST',
    url: '/staff/integrations/webhook/sync-all-salesforce-contacts',
    preValidation: async (request, reply) => {
      // No prevalidation here since this end point is called by tray webhook
      await trayMiddleware.isValidTrayRequest(request, reply);
    },
    handler: async (req, res) => {
      try {
        const salesforce_contact_list_full_sync = req.body;
        if (salesforce_contact_list_full_sync.paginated) {
          console.log('Multiple Pages present. Starting Full Sync now....');
          // await Promise.all(
          //   contacts.contact_list
          //     .filter((page) => page.value && Array.isArray(page.value))
          //     .map((page) => {
          //       return Promise.all(
          //         page.value.map((eachContact) => {
          //           const currentContactOwner = contact_owners.find((owner) =>
          //             h.cmpStr(
          //               owner.id,
          //               eachContact.properties.hubspot_owner_id,
          //             ),
          //           );
          //           return c.hubspot.addContactToPave({
          //             contact: eachContact,
          //             contact_owner: currentContactOwner,
          //             agency_user,
          //           });
          //         }),
          //       );
          //     }),
          // );
        } else {
          // Get Agency User and Agency User Details
          const { agency_user, contacts, contact_owners } =
            salesforce_contact_list_full_sync;
          await Promise.all(
            contacts.map(async (eachContact) => {
              const payload = {
                contact: eachContact,
                contact_owner:
                  contact_owners.find((owner) =>
                    h.cmpStr(owner.Id, eachContact.OwnerId),
                  ) || {},
                agency_user,
              };
              return c.salesforce.addContactToPave(payload);
            }),
          );
        }
        h.api.createResponse(
          res,
          200,
          { success: true },
          '1-tray-contact-1636986909594',
          { portal },
        );
      } catch (err) {
        h.log(err);
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-tray-contact-1636986909594',
          { portal },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/integrations/webhook/add-hubspot-contact Add contact on its creation at HubSpot
   * @apiName StaffIntegrationsHubSpotAddHubSpotContact
   * @apiVersion 1.0.0
   * @apiGroup StaffIntegrationsHubSpot
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'POST',
    url: '/staff/integrations/webhook/add-hubspot-contact',
    preValidation: async (request, reply) => {
      // No prevalidation here since this end point is called by tray webhook
      await trayMiddleware.isValidTrayRequest(request, reply);
    },
    handler: async (req, res) => {
      try {
        const new_hubspot_contact = req.body;

        // Step 1: Create Contact in Pave Database
        await c.hubspot.addContactToPave(new_hubspot_contact);
        h.api.createResponse(
          res,
          200,
          { success: true },
          '1-tray-contact-1633607552147',
          { portal },
        );
      } catch (err) {
        console.log(err);
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-tray-contact-1633607552147',
          { portal },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/integrations/webhook/update-hubspot-contact Add contact on its creation at HubSpot
   * @apiName StaffIntegrationsHubSpotAddHubSpotContact
   * @apiVersion 1.0.0
   * @apiGroup StaffIntegrationsHubSpot
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'POST',
    url: '/staff/integrations/webhook/update-hubspot-contact',
    preValidation: async (request, reply) => {
      await trayMiddleware.isValidTrayRequest(request, reply);
    },
    handler: async (req, res) => {
      try {
        const update_hubspot_contact = req.body;

        // Step 1: Create Contact in Pave Database
        await c.hubspot.updateContactInPaveV3(req, update_hubspot_contact);
        req.log.info({
          message: 'hubspot contact successfully updated.',
          url: req.url,
        });
        h.api.createResponse(
          res,
          200,
          { success: true },
          '1-tray-contact-1639494210319',
          { portal },
        );
      } catch (err) {
        req.log.error({
          err,
          url: req.url,
        });
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-tray-contact-1639494210319',
          { portal },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/integrations/webhook/update-salesforce-contact Update contact on its creation at Salesforce
   * @apiName StaffIntegrationsSalesforceUpdateSalesforceContact
   * @apiVersion 1.0.0
   * @apiGroup StaffIntegrationsSalesforce
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'POST',
    url: '/staff/integrations/webhook/update-salesforce-contact',
    preValidation: async (request, reply) => {
      await trayMiddleware.isValidTrayRequest(request, reply);
    },
    handler: async (req, res) => {
      try {
        const update_salesforce_contact = req.body;

        // Step 1: Create Contact in Pave Database
        await c.salesforce.updateContactInPave(update_salesforce_contact);
        h.api.createResponse(
          res,
          200,
          { success: true },
          '1-tray-contact-1641986001507',
          { portal },
        );
      } catch (err) {
        console.log(err);
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-tray-contact-1641986001507',
          { portal },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/integrations/webhook/add-salesforce-contact Add contact on its creation at Salesforce
   * @apiName StaffIntegrationsSalesforceAddSalesforceContact
   * @apiVersion 1.0.0
   * @apiGroup StaffIntegrationsSalesforce
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'POST',
    url: '/staff/integrations/webhook/add-salesforce-contact',
    preValidation: async (request, reply) => {
      // No prevalidation here since this end point is called by tray webhook
      await trayMiddleware.isValidTrayRequest(request, reply);
    },
    handler: async (req, res) => {
      try {
        const new_salesforce_contact = req.body;

        // Step 1: Create Contact in Pave Database
        await c.salesforce.addContactToPave(new_salesforce_contact);
        h.api.createResponse(
          res,
          200,
          { success: true },
          '1-salesforce-contact-1636813061226',
          { portal },
        );
      } catch (err) {
        console.log(err);
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-salesforce-contact-1636813061226',
          { portal },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/integrations/webhook/get-required-properties',
    preValidation: async (req, res) => {
      await trayMiddleware.isValidTrayRequest(req, res);
    },
    handler: async (req, res) => {
      try {
        const new_hubspot_contact = req.body;
        const { agency_user } = new_hubspot_contact;

        // validate that agency user exists
        h.validation.requiredParams(req.url, { agency_user });

        // default required fields
        let requested_fields =
          'firstname,email,lastname,phone,hs_object_id,hubspot_owner_id,';

        // getting custom properties from database
        const contactPropertyDefinitions =
          await c.contactPropertyDefinitions.findAll({
            agency_fk: agency_user.agency_fk,
          });

        // adding custom properties to the list of required properties
        contactPropertyDefinitions.forEach((definition) => {
          requested_fields =
            requested_fields + definition.attribute_name + ', ';
        });

        h.api.createResponse(
          res,
          200,
          { status: true, requested_fields: requested_fields },
          '',
          { portal },
        );
      } catch (err) {
        console.log(err);
        h.api.createResponse(res, 500, { success: false }, '', { portal });
      }
    },
  });

  /**
   * @api {post} /v1/staff/integrations/webhook/sync-salesforce-contacts Sync missing salesforce contact on Pave
   * @apiName StaffIntegrationsSalesforceSyncContacts
   * @apiVersion 1.0.0
   * @apiGroup StaffIntegrationsSalesforce
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */

  fastify.route({
    method: 'POST',
    url: '/staff/integrations/webhook/sync-missing-salesforce-contacts',
    preValidation: async (req, res) => {
      await trayMiddleware.isValidTrayRequest(req, res);
    },
    handler: async (req, res) => {
      const funcName = 'SalesforceController.syncMissingContacts';
      try {
        const { contacts } = req.body;
        req.log.info({
          payload: req.body,
          funcName,
          url: req.url,
        });
        const { newContacts, updatedContacts, erroredContacts } =
          await c.salesforce.syncMissingContacts(
            req,
            contacts,
            '1-salesforce-missing-contacts-sync-1655867033578',
          );
        req.log.info(
          {
            funcName,
            message: 'Sync Successful',
          },
          '1-salesforce-missing-contacts-sync-1655867033578',
        );
        h.api.createResponse(
          res,
          200,
          {
            success: true,
            processedContacts: contacts.length,
            numberOfErrors: erroredContacts.length,
            numberOfNewContacts: newContacts.length,
            numberOfUpdatedContacts: updatedContacts.length,
          },
          '1-salesforce-missing-contacts-sync-1655867033578',
          { portal },
        );
      } catch (err) {
        req.log.error(
          {
            url: req.url,
            err,
            funcName,
          },
          '2-salesforce-missing-contacts-sync-1655867033578',
        );
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-salesforce-missing-contacts-sync-1655867033578',
          { portal },
        );
      }
    },
  });

  next();
};
