const h = require('../../../../helpers');
const constant = require('../../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const userMiddleware = require('../../../../middlewares/user');
const c = require('../../../../controllers');
const models = require('../../../../models');
const config = require('../../../../configs/config')(process.env.NODE_ENV);

const Hubspot = require('hubspot');

function parseContact(contact) {
  const { firstname, hubspot_owner_id, email, lastname, phone } = contact;

  return {
    firstname: firstname?.value,
    hubspot_owner_id: hubspot_owner_id?.value,
    email: email?.value,
    lastname: lastname?.value,
    phone: phone?.value,
  };
}
module.exports = (fastify, opts, next) => {
  /**
   * @api {get} /v1/staff/integrations/hubspot/get-hubspot-contacts contact Get HubSpot Contacts From Pave Database
   * @apiName StaffIntegrationsHubSpotContactsGetAllContacts
   * @apiVersion 1.0.0
   * @apiGroup StaffIntegrationsHubSpot
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'GET',
    url: '/staff/integrations/hubspot/get-hubspot-contacts',
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
        const { pageSize = 25, pageIndex = 0 } = request.query;

        const limit = pageSize ? parseInt(pageSize) : undefined;

        const { contacts: hubspot_contacts, totalCount } =
          await c.hubspot.getHubspotContactsFromPaveV2(request);

        const metadata = {
          pageCount: pageSize ? Math.ceil(totalCount / limit) : undefined,
          pageIndex: pageIndex ? parseInt(0) : undefined,
          totalCount,
        };
        h.api.createResponse(
          response,
          200,
          { contacts: hubspot_contacts, metadata },
          '2-contact-1621773105',
          {
            portal,
          },
        );
      } catch (err) {
        console.log(`${request.url}: user failed to retrieve contacts list`, {
          err,
        });
        h.api.createResponse(response, 500, {}, '2-contact-1621773105', {
          portal,
        });
      }
    },
  });

  /**
   * @api {post} /v1/staff/integrations/hubspot/call-hubspot-webhook-full-sync Trigger HubSpot Contacts Full Sync
   * @apiName StaffIntegrationsHubSpotCallHubSpotWebhookFullSync
   * @apiVersion 1.0.0
   * @apiGroup StaffIntegrationsHubSpot
   * @apiUse ServerSuccess
   * @apiUse ServerError
   *
   */
  fastify.route({
    method: 'POST',
    url: '/staff/integrations/hubspot/call-hubspot-webhook-full-sync',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      try {
        const { agencyUser } = req.body;
        const triggerHubspotFullSync = await c.hubspot.triggerHubSpotFullSync(
          agencyUser,
        );
        h.api.createResponse(
          res,
          200,
          { success: triggerHubspotFullSync },
          '1-hubspot-contact-1634288136019',
          { portal },
        );
      } catch (err) {
        console.log(err);
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-hubspot-contact-1634288136019',
          { portal },
        );
      }
    },
  });

  // Direct integration endpoints
  fastify.route({
    method: 'POST',
    url: '/staff/integrations/hubspot/initiate-integration-request',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      try {
        const hubspot = new Hubspot({
          clientId: config.directIntegrations.hubspot.clientId,
          clientSecret: config.directIntegrations.hubspot.clientSecret,
          redirectUri: config.directIntegrations.hubspot.redirectUri,
        });

        const { agency_user } = req.body;
        const { agencyUser } = agency_user;

        const hubspotOptions = {
          client_id: config.directIntegrations.hubspot.clientId,
          scope: config.directIntegrations.hubspot.scope,
          redirect_uri: config.directIntegrations.hubspot.redirectUri,
        };

        const url = await hubspot.oauth.getAuthorizationUrl(hubspotOptions);

        h.api.createResponse(
          res,
          200,
          { success: true, url },
          '1-hubspot-direct-integration-initialize-1663065971',
          { portal },
        );
      } catch (err) {
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-hubspot-direct-integration-initialize-1663065971',
          { portal },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/integrations/hubspot/complete-integration-request',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      try {
        const hubspot = new Hubspot({
          clientId: config.directIntegrations.hubspot.clientId,
          clientSecret: config.directIntegrations.hubspot.clientSecret,
          redirectUri: config.directIntegrations.hubspot.redirectUri,
        });

        const { agencyUser, code } = req.body;

        const accessToken = await hubspot.oauth.getAccessToken({
          code,
        });

        const portalInfo = await hubspot.oauth.getPortalInfo(
          accessToken.access_token,
        );

        if (portalInfo && portalInfo.hub_id) {
          await models.agency.update(
            {
              hubspot_id: portalInfo.hub_id,
            },
            {
              where: {
                agency_id: agencyUser.agency.agency_id,
              },
            },
          );
        }

        const agency_oauth_id = h.general.generateId();

        await models.agency_oauth.update(
          {
            status: 'inactive',
          },
          {
            where: {
              agency_fk: agencyUser.agency.agency_id,
              source: 'HUBSPOT',
              status: 'active',
            },
          },
        );
        await models.agency_oauth.create({
          agency_oauth_id,
          agency_fk: agencyUser.agency.agency_id,
          status: 'active',
          source: 'HUBSPOT',
          access_info: JSON.stringify(accessToken),
        });

        // if accessToken, save return success
        h.api.createResponse(
          res,
          200,
          { success: true },
          '1-hubspot-contact-1634288136019',
          { portal },
        );
      } catch (err) {
        console.log(err);
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-hubspot-contact-1634288136019',
          { portal },
        );
      }
    },
  });

  // Direct integration endpoints
  fastify.route({
    method: 'GET',
    url: '/staff/integrations/hubspot/active-integrations',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      const { agency_id } = req.query;
      try {
        const hubspotIntegration = await models.agency_oauth.findOne({
          where: {
            agency_fk: agency_id,
            source: 'HUBSPOT',
            status: 'active',
          },
        });

        const isActive = hubspotIntegration !== null;
        let agency_oauth = {};
        if (isActive) {
          agency_oauth = {
            agency_oauth_id: hubspotIntegration.agency_oauth_id,
            agency_fk: hubspotIntegration.agency_fk,
            source: hubspotIntegration.source,
            status: hubspotIntegration.status,
          };
        } else {
          agency_oauth = {
            status: 'inactive',
          };
        }

        // if accessToken, save return success
        h.api.createResponse(
          res,
          200,
          { success: true, agency_oauth, isActive },
          '1-hubspot-direct-integration-active-integrations-1663065971',
          { portal },
        );
      } catch (err) {
        console.log(err);
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-hubspot-direct-integration-active-integrations-1663065971',
          { portal },
        );
      }
    },
  });

  fastify.route({
    method: 'DELETE',
    url: '/staff/integrations/hubspot/active-integrations/:agency_id',
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (req, res) => {
      const { agency_id } = req.params;
      try {
        await models.agency_oauth.update(
          {
            status: 'inactive',
          },
          {
            where: {
              agency_fk: agency_id,
              source: 'HUBSPOT',
              status: 'active',
            },
          },
        );

        // if accessToken, save return success
        h.api.createResponse(
          res,
          200,
          { success: true },
          '1-hubspot-direct-integration-delete-active-integrations-1663065971',
          { portal },
        );
      } catch (err) {
        console.log(err);
        h.api.createResponse(
          res,
          500,
          { success: false },
          '2-hubspot-direct-integration-delete-active-integrations-1663065971',
          { portal },
        );
      }
    },
  });

  // webhook test
  fastify.route({
    method: 'POST',
    url: '/webhooks/hubspot',
    // preValidation: async (request, reply) => {
    //   await userMiddleware.isLoggedIn(request, reply);
    //   await userMiddleware.hasAccessToStaffPortal(request, reply);
    // },
    handler: async (req, res) => {
      try {
        const { body } = req;

        if (Array.isArray(body)) {
          await req.rabbitmq.pubHsContactProcessor({
            consumerType: constant.AMQ.CONSUMER_TYPES.HS_PROCESS_CONTACTS,
            data: body,
          });
        }

        // if (Array.isArray(body)) {
        //   for (const bod of body) {
        //     // using portal_id, get agency
        //     const agencies = await models.agency.findAll({
        //       where: {
        //         hubspot_id: bod.portalId,
        //       },
        //       include: [
        //         {
        //           model: models.agency_oauth,
        //           where: { status: 'active', source: 'HUBSPOT' },
        //           require: true,
        //         },
        //       ],
        //     });

        //     console.log(agencies);

        //     if (agencies.length > 0) {
        //       for (const agency of agencies) {
        //         const agencyOauth = agency.dataValues.agency_oauth;
        //         const tokens = JSON.parse(agencyOauth.dataValues.access_info);
        //         // console.log(agencyOauth);

        //         const hubspot = new Hubspot({
        //           clientId: 'b9c33a7b-7802-4b20-a587-1cb9e1b5ea07',
        //           clientSecret: '70b89c8e-d99d-48c8-a63f-41043fb27943',
        //           redirectUri:
        //             'http://localhost:3112/settings/hubspot-redirect-page',
        //           refreshToken: tokens.refresh_token,
        //         });

        //         const { contact, owner } = await hubspot
        //           .refreshAccessToken()
        //           .then(async (results) => {
        //             // console.log(results.access_token);

        //             // this assigns the new accessToken to the client, so your client is ready
        //             // to use
        //             // console.log(hubspot.accessToken);
        //             const contact = await hubspot.contacts.getById(
        //               bod.objectId,
        //             );
        //             const owner = await hubspot.owners.getById(
        //               contact.properties.hubspot_owner_id.value,
        //             );

        //             return { contact, owner };
        //           });

        //         // const contact = await

        //         const hs_object_id = bod.objectId;
        //         // create or update contact
        //         const contact_owner = owner;

        //         console.log(contact);

        //         const agency_user = { agency_fk: agency.dataValues.agency_id };

        //         if (bod.subscriptionType !== 'contact.propertyChange') {
        //           await c.hubspot.addContactToPave({
        //             contact: {
        //               properties: {
        //                 hs_object_id,
        //                 ...parseContact(contact.properties),
        //               },
        //             },
        //             contact_owner,
        //             agency_user,
        //           });
        //         } else {
        //           await c.hubspot.updateContactInPaveV3(req, {
        //             contact: {
        //               properties: {
        //                 hs_object_id,
        //                 ...parseContact(contact.properties),
        //               },
        //             },
        //             contact_owner,
        //             agency_user,
        //           });

        //           // test engagement
        //           /*
        //           { engagement:
        //                 { active: true,
        //                   ownerId: 1,
        //                   type: 'NOTE',
        //                   timestamp: 1409172644778 },
        //               associations:
        //                 { contactIds: [ 11877974 ],
        //                   companyIds: [],
        //                   dealIds: [],
        //                   ownerIds: [] },
        //               attachments: [ { id: 4241968539 } ],
        //               metadata: { body: 'note body' } },
        //             json: true }
        //           */

        //           await hubspot.refreshAccessToken().then(async (results) => {
        //             // console.log(results.access_token);

        //             // this assigns the new accessToken to the client, so your client is ready
        //             // to use
        //             // console.log(hubspot.accessToken);
        //             return hubspot.engagements.create({
        //               engagement: {
        //                 active: true,
        //                 type: 'NOTE',
        //                 timestamp: 1409172644778,
        //               },
        //               associations: {
        //                 contactIds: [bod.objectId],
        //                 companyIds: [],
        //                 dealIds: [],
        //                 ownerIds: [],
        //               },
        //               metadata: { body: 'Contact was updated' },
        //             });
        //           });
        //         }
        //       }
        //     }
        //     // using portal id
        //   }
        // }

        // if accessToken, save return success
        h.api.createResponse(
          res,
          200,
          { success: true },
          '1-hubspot-contact-1634288136019',
          { portal },
        );
      } catch (err) {
        h.api.createResponse(
          res,
          200,
          { success: true },
          '2-hubspot-contact-1634288136019',
          { portal },
        );
      }
    },
  });

  next();
};
