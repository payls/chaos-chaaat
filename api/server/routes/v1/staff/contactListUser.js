const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const models = require('../../../models');
const axios = require('axios');
const sequelize = require('sequelize');
const { Op } = sequelize;
const c = require('../../../controllers');
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');
const agencyMiddleware = require('../../../middlewares/agency');
const config = require('../../../../server/configs/config')(
  process.env.NODE_ENV,
);

const userRoleController =
  require('../../../controllers/userRole').makeUserRoleController(models);

const contactListController =
  require('../../../controllers/contactList').makeController(models);

const contactListUserController =
  require('../../../controllers/contactListUser').makeController(models);

const { Client } = require('@hubspot/api-client');

module.exports = (fastify, opts, next) => {
  /**
   * @api {post} /v1/staff/create-list-contacts Staff create list contacts record
   * @apiName StaffCreateListContact
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact List User
   * @apiUse ServerError
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
    url: '/staff/create-list-contacts',
    body: {
      type: 'object',
      required: ['contact_list_id', 'contact_list'],
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
      await agencyMiddleware.canAddContactViaContactUpload(request, reply);
    },
    handler: async (request, reply) => {
      try {
        const requestBody = request.body;
        const { contact_list_id, contact_list } = requestBody;
        const { user_id } = h.user.getCurrentUser(request);
        const contactListRecord = await contactListController.findOne({
          contact_list_id,
        });

        const contact_import_type = h.notEmpty(requestBody?.contact_type)
          ? requestBody?.contact_type
          : 'CSV';

        // Check if contact list record already exist
        if (h.notEmpty(contactListRecord)) {
          // set contact list as generating
          await contactListController.update(
            contact_list_id,
            { status: 'GENERATING' },
            null,
          );
          const result = await request.rabbitmq.pubCSVContactListCreation({
            data: {
              contact_list_id,
              contact_list,
              contact_import_type,
              user_id,
            },
            consumerType:
              constant.AMQ.CONSUMER_TYPES.CONTACT_LIST_FROM_CSV_UPLOAD,
          });
          h.api.createResponse(
            request,
            reply,
            200,
            {},
            '1-contact-list-in-progress-1620396460',
            { portal },
          );
        } else {
          // Contact record does not exist
          console.log(`${request.url}: failed to read contact list.`, {
            contactListRecord,
          });
          h.api.createResponse(
            request,
            reply,
            409,
            {},
            '2-contact-list-not-found-1621771554',
            {
              portal,
            },
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to create contact list.`, { err });
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-contact-list-1620396470',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {delete} /v1/staff/contact-list-user/:contact_list_user_id Staff delete list contact
   * @apiName StaffDeleteListContact
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact List User
   * @apiUse ServerError
   *
   **/
  fastify.route({
    method: 'DELETE',
    url: '/staff/contact-list-user/:contact_list_user_id',
    schema: {
      params: {
        contact_list_user_id: { type: 'string' },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { contact_list_user_id } = req.params;

      try {
        const contact_list_user = await contactListUserController.findOne({
          contact_list_user_id: contact_list_user_id,
        });

        if (contact_list_user) {
          await contactListUserController.destroy({
            contact_list_user_id: contact_list_user_id,
          });
          const where = {
            contact_list_id: contact_list_user?.contact_list_id,
          };
          const contactListUserCount = await contactListUserController.count(
            where,
          );
          await models.contact_list.update(
            {
              user_count: contactListUserCount,
              status: constant.CONTACT_LIST.STATUS.PUBLISHED,
            },
            {
              where: {
                contact_list_id: contact_list_user?.contact_list_id,
              },
            },
          );

          h.api.createResponse(
            req,
            res,
            200,
            {},
            '1-delete-contact-list-user-1663834299369',
            {
              portal,
            },
          );
        } else {
          throw new Error(`Contact list user not found.`);
        }
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          url: '/v1/staff/contact-list-user/:contact_list_user_id',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-delete-contact-list-user-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/create-list-contacts-from-existing Staff process add list contacts from existing record
   * @apiName ProcessCreateListContactFromExisting
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact List User
   * @apiUse ServerError
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
    url: '/staff/create-list-contacts-from-existing',
    body: {
      type: 'object',
      required: ['contact_list_id', 'contact_list'],
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      const transaction = await models.sequelize.transaction();
      try {
        const { contact_list_id, contact_list, line } = request.body;
        const { user_id } = h.user.getCurrentUser(request);
        const contactListRecord = await contactListController.findOne(
          {
            contact_list_id,
          },
          {
            transaction,
          },
        );

        // Check if contact record already exist in the list
        if (!h.general.isEmpty(contactListRecord)) {
          const processedContactIds = [];
          for (const contact of contact_list) {
            const contactListUserRecord =
              await contactListUserController.findOne(
                {
                  contact_list_id,
                  contact_id: contact.contact_id,
                },
                {
                  transaction,
                },
              );
            if (
              h.general.isEmpty(contactListUserRecord) &&
              !processedContactIds.includes(contact.contact_id)
            ) {
              const contact_list_user_id =
                await contactListUserController.create(
                  {
                    contact_list_id,
                    contact_id: contact.contact_id,
                    import_type: h.isEmpty(line) ? 'EXISTING' : 'LINE',
                    created_by: user_id,
                  },
                  { transaction },
                );
              console.log(contact_list_user_id);
            }

            const contactSourceRecord = await models.contact_source.findOne(
              {
                where: {
                  contact_fk: contact.contact_id,
                },
              },
              { transaction },
            );

            if (h.general.isEmpty(contactSourceRecord)) {
              // create cotact source record
              const contact_source_id = h.general.generateId();
              await models.contact_source.create({
                contact_source_id,
                contact_fk: contact.contact_id,
                source_contact_id: contact.contact_id,
                source_type: 'webapp_admin',
                source_meta: null,
                source_original_payload: null,
                created_by: null,
                updated_by: null,
              });
            }

            processedContactIds.push(contact.contact_id);
          }
          await transaction.commit();
          const where = {
            contact_list_id: contact_list_id,
          };
          const contactListUserCount = await contactListUserController.count(
            where,
          );
          await models.contact_list.update(
            {
              user_count: contactListUserCount,
              source_type: h.isEmpty(line) ? null : 'LINE',
              source_value: h.isEmpty(line) ? null : line,
              status: constant.CONTACT_LIST.STATUS.PUBLISHED,
            },
            {
              where: {
                contact_list_id: contact_list_id,
              },
            },
          );
          h.api.createResponse(
            request,
            reply,
            200,
            { contact_list_id, contact_list, contactListUserCount },
            '1-contact-list-1620396460',
            { portal },
          );
        } else {
          await transaction.rollback();
          // Contact record already exist
          console.log(`${request.url}: failed to read contact list.`, {
            contactListRecord,
          });
          h.api.createResponse(
            request,
            reply,
            409,
            {},
            '2-contact-list-1621771554',
            {
              portal,
            },
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to create contact list.`, { err });
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-contact-list-1620396470',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {get} /v1/staff/hubspot-contact-list Pull hubspot contact list using custom variable
   * @apiName StaffPullHubSpotContacts
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact List User
   * @apiUse ServerError
   *
   * @apiParam {string="agency_id"} agency id
   * @apiParam {string="variable_name"} variable name from hubspot
   * @apiParam {string="variable_value"} variable value
   **/
  fastify.route({
    method: 'GET',
    url: '/staff/hubspot-contact-list',
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    schema: {
      query: {
        agency_id: { type: 'string' },
        property_name: { type: 'string' },
        property_value: { type: 'string' },
      },
    },
    handler: async (req, res) => {
      const { agency_id, property_name, property_value } = req.query;
      const { user_id } = h.user.getCurrentUser(req);
      const data = [];
      let contact_property_definition_id;

      let agencyOauth = await models.agency_oauth.findOne({
        where: {
          agency_fk: agency_id,
          status: 'active',
          source: 'HUBSPOT',
        },
      });

      try {
        agencyOauth =
          agencyOauth && agencyOauth.toJSON
            ? agencyOauth.toJSON()
            : agencyOauth;

        const { refresh_token } = JSON.parse(agencyOauth.access_info);

        const currentAgencyUser = await c.agencyUser.findOne({
          user_fk: user_id,
        });

        const hubspotClient = new Client({
          clientId: config.directIntegrations.hubspot.clientId,
          clientSecret: config.directIntegrations.hubspot.clientSecret,
        });

        const oauthRefreshResponse =
          await h.hubspot.generateRefreshedAccessToken({
            refresh_token: refresh_token,
            client_id: config.directIntegrations.hubspot.clientId,
            client_secret: config.directIntegrations.hubspot.clientSecret,
            log: req.log,
          });

        req.log.info('ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️', oauthRefreshResponse);

        if (h.cmpBool(oauthRefreshResponse.success, false)) {
          return h.api.createResponse(
            req,
            res,
            500,
            {},
            '2-hubspot-contact-list-oauth-1663834299369',
            {
              portal,
            },
          );
        }
        hubspotClient.setAccessToken(oauthRefreshResponse.access_token);

        const contactPropertyDefinition =
          await models.contact_property_definitions.findOne({
            where: {
              agency_fk: agency_id,
              attribute_name: property_name,
              attribute_source: 'HUBSPOT',
            },
          });

        if (!contactPropertyDefinition) {
          contact_property_definition_id = h.general.generateId();
          await models.contact_property_definitions.create({
            contact_property_definition_id,
            agency_user_fk: currentAgencyUser?.agency_user_id,
            agency_fk: agency_id,
            attribute_name: property_name,
            attribute_type: 'string',
            attribute_source: 'HUBSPOT',
            status: 'active',
          });
        } else {
          contact_property_definition_id =
            contactPropertyDefinition?.contact_property_definition_id;
        }

        const allOwners = {};
        let ownerResponse;
        let ownerAfter;
        const email = undefined;
        const archived = false;

        do {
          ownerResponse = await hubspotClient.crm.owners.ownersApi.getPage(
            email,
            ownerAfter,
            10,
            archived,
          );
          for (const owner of ownerResponse.results) {
            const ownerID = owner.id;
            allOwners[ownerID] = {
              firstName: owner.firstName,
              lastName: owner.lastName,
              email: owner.email,
            };
            const user = await models.user.findOne({
              where: {
                email: owner.email,
              },
            });
            if (!user) {
              const user_id = h.general.generateId();
              await models.user.create({
                user_id,
                first_name: owner.firstName,
                last_name: owner.lastName,
                email: owner.email,
                status: 'inactive',
                created_by: user_id,
              });
              const user_role_id = h.general.generateId();
              await models.user_role.create({
                user_role_id,
                user_fk: user_id,
                user_role: 'agency_sales',
                created_by: user_id,
              });
              const agency_user_id = h.general.generateId();
              await models.agency_user.create({
                agency_user_id,
                agency_fk: agency_id,
                user_fk: user_id,
                created_by: currentAgencyUser?.agency_user_id,
              });
            }
          }
          if (ownerResponse.paging !== undefined) {
            ownerAfter = ownerResponse.paging.next.after;
          }
        } while (ownerResponse.paging !== undefined);

        const limit = 100;
        let after = null;
        let response;
        const allContacts = [];

        do {
          response = await hubspotClient.crm.contacts.searchApi.doSearch({
            filterGroups: [
              {
                filters: [
                  {
                    propertyName: property_name,
                    operator: 'EQ',
                    value: property_value,
                  },
                ],
              },
            ],
            limit: limit,
            after,
            sorts: [
              {
                propertyName: 'createdate',
                direction: 'DESCENDING',
              },
            ],
            properties: [
              'hs_object_id',
              'email',
              'firstname',
              'lastname',
              'mobilephone',
              'phone',
              'hubspot_owner_id',
              'owner',
            ],
            deduplicate: true,
          });
          allContacts.push(...response.results);
          if (response.paging !== undefined) {
            console.log(response.paging);
            after = response.paging.next.after;
          }
        } while (response.paging !== undefined);

        console.log('looping through found contacts');
        for (const contact of allContacts) {
          const ownerId = contact?.properties?.hubspot_owner_id;

          let owner_user;
          let ownerName = '';

          if (ownerId) {
            const ownerDetails = allOwners[ownerId];
            if (ownerDetails) {
              ownerName = `${ownerDetails.firstName} ${ownerDetails.lastName}`;

              owner_user = await models.user.findOne({
                where: {
                  first_name: ownerDetails.firstName,
                  last_name: ownerDetails.lastName,
                },
                include: [
                  {
                    model: models.agency_user,
                    where: {
                      agency_fk: agency_id,
                    },
                    include: [
                      {
                        model: models.agency,
                      },
                    ],
                  },
                ],
              });
            }
          }

          if (
            h.notEmpty(contact?.properties?.mobilephone) ||
            h.notEmpty(contact?.properties?.phone)
          ) {
            const mobile_number = h.notEmpty(contact?.properties?.mobilephone)
              ? contact?.properties?.mobilephone.replace(/[^0-9]/g, '')
              : h.notEmpty(contact?.properties?.phone)
              ? contact?.properties?.phone.replace(/[^0-9]/g, '')
              : null;

            const contact_owner_id = owner_user?.agency_user?.agency_user_id
              ? owner_user?.agency_user?.agency_user_id
              : null;

            const contact_owner_name = ownerName || null;

            const newRow = {
              record_id: contact?.properties?.hs_object_id,
              first_name: contact?.properties?.firstname,
              last_name: contact?.properties?.lastname,
              email: contact?.properties?.email,
              phone_number: mobile_number,
              contact_owner_id: contact_owner_id,
              contact_owner: contact_owner_name,
              contact_property_definition_id: contact_property_definition_id,
              property_name: property_name,
              property_value: property_value,
            };
            // console.log(newRow);
            data.push(newRow);
          }
        }

        h.api.createResponse(
          req,
          res,
          200,
          { results: data },
          '1-contact-list-1663834299369',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        req.log.error({
          err,
          method: 'GET',
          url: '/staff/hubspot-contact-list',
        });
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-contact-list-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/create-list-contacts-from-hubspot Staff process add list contacts from hubspot record
   * @apiName ProcessCreateListContactFromExisting
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact List User
   * @apiUse ServerError
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
    url: '/staff/create-list-contacts-from-hubspot',
    body: {
      type: 'object',
      required: [
        'contact_list_id',
        'contact_list',
        'property_name',
        'property_value',
      ],
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
      await agencyMiddleware.canAddContactViaHubSpotPulling(request, reply);
    },
    handler: async (request, reply) => {
      const transaction = await models.sequelize.transaction();
      try {
        const { contact_list_id, contact_list, property_name, property_value } =
          request.body;
        const { user_id } = h.user.getCurrentUser(request);
        const currentAgencyUser = await c.agencyUser.findOne({
          user_fk: user_id,
        });
        const contactListRecord = await contactListController.findOne(
          {
            contact_list_id,
          },
          {
            transaction,
          },
        );

        // Check if contact list record already exist
        if (!h.general.isEmpty(contactListRecord)) {
          const processedContactIds = [];
          for (const contact of contact_list) {
            const agency_id = contactListRecord?.dataValues?.agency_fk;
            const mobile_number = contact.phone_number;
            let contact_id = null;
            const contactRecord = await models.contact.findOne(
              {
                where: {
                  [Op.and]: [
                    sequelize.literal("REPLACE(mobile_number, ' ', '')"),
                    sequelize.literal("REPLACE(mobile_number, '-', '')"),
                    sequelize.literal("REPLACE(mobile_number, '+', '')"),
                  ],
                  mobile_number: mobile_number,
                  agency_fk: agency_id,
                },
              },
              { transaction },
            );
            if (h.general.isEmpty(contactRecord)) {
              console.log('create');
              // Create contact
              contact_id = h.general.generateId();
              await models.contact.create(
                {
                  contact_id,
                  first_name: contact.first_name,
                  last_name: contact.last_name,
                  email: contact.email ? contact.email.trim() : contact.email,
                  mobile_number: mobile_number.trim(),
                  agency_fk: agency_id,
                  agency_user_fk: contact.contact_owner
                    ? contact.contact_owner
                    : null,
                  from_export: true,
                  status: 'active',
                  created_by: user_id,
                },
                { transaction },
              );

              const contactSource = await models.contact_source.findOne({
                where: {
                  contact_fk: contact_id,
                  source_contact_id: contact.record_id,
                  source_type: 'HUBSPOT',
                },
              });

              if (!contactSource) {
                const contact_source_id = h.general.generateId();
                await models.contact_source.create(
                  {
                    contact_source_id,
                    contact_fk: contact_id,
                    source_contact_id: contact.record_id,
                    source_type: 'HUBSPOT',
                  },
                  { transaction },
                );
              }

              const contactPropertyValue =
                await models.contact_property_values.findOne({
                  where: {
                    contact_fk: contact_id,
                    contact_property_definition_fk:
                      contact.contact_property_definition_id,
                    attribute_value_string: property_value,
                  },
                });

              if (!contactPropertyValue) {
                const contact_property_value_id = h.general.generateId();
                await models.contact_property_values.create({
                  contact_property_value_id,
                  contact_fk: contact_id,
                  contact_property_definition_fk:
                    contact.contact_property_definition_id,
                  attribute_value_string: property_value,
                  created_by: currentAgencyUser?.agency_user_id,
                });
              }

              // Create contact list record
              const contact_list_user_id =
                await contactListUserController.create(
                  {
                    contact_list_id,
                    contact_id: contact_id,
                    hubspot_id: contact.record_id,
                    import_type: 'HUBSPOT',
                    created_by: user_id,
                  },
                  { transaction },
                );
            } else {
              console.log('update');
              contact_id = contactRecord?.contact_id;
              const updateBody = {
                first_name: contact.first_name,
                last_name: contact.last_name,
                email: contact.email ? contact.email.trim() : contact.email,
                mobile_number: mobile_number.trim(),
                agency_fk: agency_id,
                agency_user_fk: contact.contact_owner
                  ? contact.contact_owner
                  : null,
              };

              await models.contact.update(
                updateBody,
                {
                  where: { contact_id },
                },
                { transaction },
              );

              const contactSource = await models.contact_source.findOne({
                where: {
                  contact_fk: contact_id,
                  source_contact_id: contact.record_id,
                  source_type: 'HUBSPOT',
                },
              });

              if (!contactSource) {
                const contact_source_id = h.general.generateId();
                await models.contact_source.create(
                  {
                    contact_source_id,
                    contact_fk: contact_id,
                    source_contact_id: contact.record_id,
                    source_type: 'HUBSPOT',
                  },
                  { transaction },
                );
              }

              const contactPropertyValue =
                await models.contact_property_values.findOne({
                  where: {
                    contact_fk: contact_id,
                    contact_property_definition_fk:
                      contact.contact_property_definition_id,
                    attribute_value_string: property_value,
                  },
                });

              if (!contactPropertyValue) {
                const contact_property_value_id = h.general.generateId();
                await models.contact_property_values.create({
                  contact_property_value_id,
                  contact_fk: contact_id,
                  contact_property_definition_fk:
                    contact.contact_property_definition_id,
                  attribute_value_string: property_value,
                  created_by: currentAgencyUser?.agency_user_id,
                });
              }

              const contactListUserRecord =
                await contactListUserController.findOne(
                  {
                    contact_list_id,
                    contact_id,
                  },
                  { transaction },
                );
              if (
                h.isEmpty(contactListUserRecord) &&
                !processedContactIds.includes(contact_id)
              ) {
                // Create contact list user record
                const contact_list_user_id =
                  await contactListUserController.create(
                    {
                      contact_list_id,
                      contact_id,
                      hubspot_id: contact.record_id,
                      import_type: 'HUBSPOT',
                      created_by: user_id,
                    },
                    { transaction },
                  );
              }
            }
            processedContactIds.push(contact_id);
          }
          await transaction.commit();
          const where = {
            contact_list_id: contact_list_id,
          };
          const contactListUserCount = await contactListUserController.count(
            where,
          );
          await models.contact_list.update(
            {
              user_count: contactListUserCount,
              list_property_name: property_name,
              list_property_value: property_value,
              status: constant.CONTACT_LIST.STATUS.PUBLISHED,
            },
            {
              where: {
                contact_list_id: contact_list_id,
              },
            },
          );
          // check if contact capacity is now 80 90 or 100
          await c.agencyNotification.checkContactCapacityAfterUpdate(
            contactListRecord?.dataValues?.agency_fk,
          );
          return h.api.createResponse(
            request,
            reply,
            200,
            { contact_list_id, contact_list, contactListUserCount },
            '1-contact-list-1620396460',
            { portal },
          );
        } else {
          await transaction.rollback();
          // Contact record already exist
          console.log(`${request.url}: failed to read contact list.`, {
            contactListRecord,
          });
          return h.api.createResponse(
            request,
            reply,
            409,
            {},
            '2-contact-list-1621771554',
            {
              portal,
            },
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: failed to create contact list.`, { err });
        return h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-contact-list-1620396470',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/contact-list/hubspot/members Staff process fetch list members
   * @apiName ProcessImportHubSpotContactListMembers
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact List User
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
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
    url: '/staff/contact-list/hubspot/members',
    body: {
      type: 'object',
      required: ['agency_id', 'hubspot_list'],
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, reply) => {
      const transaction = await models.sequelize.transaction();
      try {
        const { agency_id, hubspot_list } = request.body;
        const { user_id } = h.user.getCurrentUser(request);

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
            reply,
            500,
            {},
            '2-hubspot-contact-list-oauth-1663834299369',
            {
              portal,
            },
          );
        }

        const listId = hubspot_list.list_id;

        const membership = await h.hubspot.getAllListMemberships(
          hubspotClient,
          listId,
          10,
          request.log,
        );

        h.api.createResponse(
          request,
          reply,
          200,
          { membership },
          '1-hubspot-contact-list-members-1730254462',
          {
            portal,
          },
        );
      } catch (err) {
        Sentry.captureException(err);
        request.log.error(
          `${request.url}: failed to retrieve hubspot list members.`,
          { err },
        );
        return h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-hubspot-contact-list-members-1730254462',
          {
            portal,
          },
        );
      }
    },
  });

  /**
   * @api {post} /v1/staff/contact-list/hubspot Staff process hubspot contact list to save in database
   * @apiName ProcessImportHubSpotContactList
   * @apiVersion 1.0.0
   * @apiGroup Staff Contact List User
   * @apiUse ServerError
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
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
    url: '/staff/contact-list/hubspot',
    body: {
      type: 'object',
      required: ['contact_list_id', 'contact_list'],
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
      await agencyMiddleware.canAddContactViaHubSpotPulling(request, reply);
    },
    handler: async (request, reply) => {
      try {
        const { contact_list_id, contact_list } = request.body;
        const { user_id } = h.user.getCurrentUser(request);
        const contactListRecord = await contactListController.findOne({
          contact_list_id,
        });

        // Check if contact list record already exist
        if (h.notEmpty(contactListRecord)) {
          const agency_id = contactListRecord?.dataValues?.agency_fk;
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

          const { oauthRefreshResponse } = await h.hubspot.hubspotConnect({
            agencyOauth,
            log: request.log,
          });

          // if failed to connect, return error
          if (h.cmpBool(oauthRefreshResponse.success, false)) {
            return h.api.createResponse(
              request,
              reply,
              500,
              {},
              '2-hubspot-contact-list-oauth-1663834299369',
              {
                portal,
              },
            );
          }

          // set contact list as generating
          await contactListController.update(
            contact_list_id,
            { status: 'GENERATING' },
            null,
          );
          const result = await request.rabbitmq.pubHubSpotContactListCreation({
            data: {
              contact_list_id,
              contact_list,
              user_id,
            },
            consumerType:
              constant.AMQ.CONSUMER_TYPES.CONTACT_LIST_FROM_HUBSPOT_LIST_UPLOAD,
          });
          h.api.createResponse(
            request,
            reply,
            200,
            { result },
            '1-contact-list-in-progress-1620396460',
            { portal },
          );
        } else {
          // Contact record already exist
          request.log.error(`${request.url}: failed to read contact list.`, {
            contactListRecord,
          });
          return h.api.createResponse(
            request,
            reply,
            409,
            {},
            '2-contact-list-not-found-1621771554',
            {
              portal,
            },
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        request.log.error(`${request.url}: failed to create contact list.`, {
          err,
        });
        return h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-contact-list-in-progress-1620396460',
          {
            portal,
          },
        );
      }
    },
  });
  next();
};
