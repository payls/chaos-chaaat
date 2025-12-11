const Sentry = require('@sentry/node');
const models = require('../../models');
const h = require('../../helpers');
const constant = require('../../constants/constant.json');
const contactController =
  require('../../controllers/contact').makeContactController(models);
const agencyUserController =
  require('../../controllers/agencyUser').makeAgencyUserController(models);
const shortListedPropertyController =
  require('../../controllers/shortListedProperty').makeShortListedPropertyController(
    models,
  );
const projectPropertyController =
  require('../../controllers/projectProperty').makeProjectPropertyController(
    models,
  );
const shortListedProjectController =
  require('../../controllers/shortlistedProject').makeShortListedProjectController(
    models,
  );
const projectMediaController =
  require('../../controllers/projectMedia').makeProjectMediaController(models);

const featureController =
  require('../../controllers/feature').makeFeatureController(models);

const whatsAppMessageTrackerController =
  require('../../controllers/whatsappMessageTracker').makeController(models);

const whatsAppChatController =
  require('../../controllers/whatsappChat').makeController(models);

const agencyCampaignEventDetailsController =
  require('../../controllers/agencyCampaignEventDetails').makeController(
    models,
  );

const agencyWhatsAppConfigController =
  require('../../controllers/agencyWhatsappConfig').makeController(models);

module.exports = (fastify, opts, next) => {
  /**
   * @api {get} /v1/contact/:permalink/shortlisted_project Get contact along with shortlisted projects
   * @apiName ContactGetContactWithShortlistedProject
   * @apiVersion 1.0.0
   * @apiGroup Contact
   * @apiUse ServerError
   *
   * @apiParam {string} permalink Contact permalink
   *
   * @apiDefine ServerSuccess
   * @apiSuccess {string} status Response status.
   * @apiSuccess {string} message Message to display to user.
   * @apiSuccess {string} message_code Message code of message for developer use.
   * @apiSuccess {string} contact_id Contact id.
   * @apiSuccess {string} shortlisted_project_id Short listed project id.
   *
   */
  fastify.route({
    method: 'GET',
    url: '/contact/:permalink/shortlisted_project',
    schema: {
      params: {
        type: 'object',
        required: ['permalink'],
        properties: {
          permalink: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      // get portal for request(as we need to allow CORS to webapp and webapp admin)
      const portal = h.request.getPortal(request);
      try {
        const { permalink } = request.params;
        const contactRecord = await contactController.findOne(
          { permalink },
          {
            include: [
              { model: models.agency, required: true, as: 'agency' },
              {
                model: models.agency_user,
                required: true,
                as: 'agency_user',
                include: [
                  {
                    model: models.user,
                    attributes: {
                      exclude: ['password', 'password_salt'],
                    },
                  },
                ],
              },
            ],
          },
        );

        if (h.isEmpty(contactRecord)) {
          h.api.createResponse(
            request,
            reply,
            200,
            {},
            '2-contact-1630304759',
            {
              portal,
            },
          );
        } else {
          let shortlistedProjectRecords =
            await shortListedProjectController.findAll(
              { contact_fk: contactRecord.contact_id },
              {
                include: [
                  {
                    model: models.project,
                    required: false,
                    // where: { is_deleted: 0 },
                    include: [
                      {
                        model: models.project_media,
                        required: false,
                        include: [
                          {
                            model: models.project_media_tag,
                            required: true,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            );
          let shortlistedPropertyRecords = {};
          // To handle permalinks with shortlisted_properties but no shortlisted_projects
          if (h.isEmpty(shortlistedProjectRecords)) {
            shortlistedPropertyRecords =
              await shortListedPropertyController.findAll(
                { contact_fk: contactRecord.contact_id },
                {
                  include: [
                    {
                      model: models.project_property,
                      required: true,
                      where: { is_deleted: 0 },
                      include: [
                        { model: models.project, required: false },
                        {
                          model: models.project_media_property,
                          required: false,
                          include: [
                            {
                              model: models.project_media,
                              include: [{ model: models.project_media_tag }],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              );
            // obtain list of unique shortlisted projects
            if (h.notEmpty(shortlistedPropertyRecords)) {
              const tempSelectedProjects = [];
              // Get the unique projects from shortlisted properties
              for (let i = 0; i < shortlistedPropertyRecords.length; i++) {
                const property = shortlistedPropertyRecords[i];
                if (
                  h.notEmpty(property.project_property.project_fk) &&
                  !tempSelectedProjects.includes(
                    property.project_property.project_fk,
                  )
                ) {
                  tempSelectedProjects.push(
                    property.project_property.project_fk,
                  );
                }
              }
              let display_order_count = 1;
              for (const indx in tempSelectedProjects) {
                const project_id = tempSelectedProjects[indx];
                await shortListedProjectController.create({
                  contact_fk: contactRecord.contact_id,
                  project_fk: project_id,
                  created_by: contactRecord.dataValues.agency_user.user_fk,
                  display_order: display_order_count,
                });
                display_order_count += 1;
              }
              // Place newly created shortlisted_projects back into the return obj
              shortlistedProjectRecords =
                await shortListedProjectController.findAll(
                  { contact_fk: contactRecord.contact_id, is_deleted: 0 },
                  {
                    include: [
                      {
                        model: models.project,
                        required: false,
                        include: [
                          {
                            model: models.project_media,
                            required: false,
                            include: [
                              {
                                model: models.project_media_tag,
                                required: true,
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                );
            }
          }
          // for the case when we have shortlisted_projects but not shortlisted properties
          if (h.isEmpty(shortlistedPropertyRecords)) {
            shortlistedPropertyRecords =
              await shortListedPropertyController.findAll(
                { contact_fk: contactRecord.contact_id, is_deleted: 0 },
                {
                  include: [
                    {
                      model: models.project_property,
                      required: true,
                      where: { is_deleted: 0 },
                      include: [
                        { model: models.project, required: false },
                        {
                          model: models.project_media_property,
                          required: false,
                          include: [
                            {
                              model: models.project_media,
                              include: [{ model: models.project_media_tag }],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              );
          }
          const parsedShortlistedProperties =
            await shortListedPropertyController.parseShortlistedProperties(
              shortlistedPropertyRecords,
            );
          await shortListedProjectController.insertShortlistedProperties(
            parsedShortlistedProperties,
            shortlistedProjectRecords,
          );

          h.api.createResponse(
            request,
            reply,
            200,
            {
              contact: contactRecord,
              shortlisted_projects: shortlistedProjectRecords,
            },
            '1-contact-1621560037508',
            { portal },
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${request.url}: failed to retrieve contact with shortlisted project`,
          { err },
        );
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-contact-1621560006601',
          { portal },
        );
      }
    },
  });

  /**
   * @api {get} /v1/contact/:permalink/shortlisted_property Get contact along with shortlisted properties
   * @apiName ContactGetContactWithShortlistedProperty
   * @apiVersion 1.0.0
   * @apiGroup Contact
   * @apiUse ServerError
   *
   * @apiParam {string} permalink Contact permalink
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
   *      "contact": {
   *        "created_date_seconds": 22000,
   *        "created_date_time_ago": "9 hours ago",
   *        "updated_date_seconds": 22000,
   *        "updated_date_time_ago": "9 hours ago",
   *        "contact_id": "e989b3c0-babb-11eb-a9ef-741d33a7ad70",
   *        "first_name": "Mervin",
   *        "last_name": "Tan",
   *        "email": "mervintankw@gmail.com",
   *        "mobile_number": "90938379",
   *        "permalink": "e989b3c0-babb-11eb-a9ef-741d33a7ad70",
   *        "profile_picture_url": "https://myprofilepic.com",
   *        "agency_fk": "03885a2e-babc-11eb-a9ef-741d33a7ad70",
   *        "agency_user_fk": "03885a2e-babc-11eb-a9ef-741d33a7ad70",
   *        "created_by": "e989b3c0-babb-11eb-a9ef-741d33a7ad70",
   *        "created_date": "22 May 2021 05:10 am",
   *        "updated_by": "e989b3c0-babb-11eb-a9ef-741d33a7ad70",
   *        "updated_date": "22 May 2021 05:10 am",
   *        "created_date_raw": "2021-05-22T05:10:17.000Z",
   *        "updated_date_raw": "2021-05-22T05:10:47.000Z",
   *        "agency": {
   *           "created_date_seconds": 1621660222000,
   *           "created_date_time_ago": "11 hours ago",
   *           "updated_date_seconds": 1621660233000,
   *           "updated_date_time_ago": "11 hours ago",
   *           "agency_id": "03885a2e-babc-11eb-a9ef-741d33a7ad70",
   *           "agency_name": "Mervin Real Estate",
   *           "agency_logo_url": "Some logo url",
   *           "created_by": null,
   *           "created_date": "2021-05-22T05:10:22.000Z",
   *           "updated_by": null,
   *           "updated_date": "2021-05-22T05:10:33.000Z"
   *         },
   *         "agency_user": {
   *           "created_date_seconds": 1621698640000,
   *           "created_date_time_ago": "41 minutes ago",
   *           "updated_date_seconds": 1621698657000,
   *           "updated_date_time_ago": "41 minutes ago",
   *           "agency_user_id": "7afb0288-bb15-11eb-a9ef-741d33a7ad70",
   *           "user_fk": "9a35e5fd-a2a9-4b54-8e8a-37372c3c248d",
   *           "agency_fk": "03885a2e-babc-11eb-a9ef-741d33a7ad70",
   *           "created_by": null,
   *           "created_date": "2021-05-22T15:50:40.000Z",
   *           "updated_by": null,
   *           "updated_date": "2021-05-22T15:50:57.000Z",
   *           "user": {
   *             "full_name": "Mervin Tan",
   *             "profile_picture_url": "user/profile/f8c9fe08a407011740f824a3b92fadf6d19bd9e555fefc770a6a0f39d1ccb26057395ecf263ba8f953d397866a0377ac9a8a6235abbbbe67e8fc456a518e2136.jpeg",
   *             "created_date_seconds": 1615774148000,
   *             "created_date_time_ago": "2 months ago",
   *             "updated_date_seconds": 1615774148000,
   *             "updated_date_time_ago": "2 months ago",
   *             "user_id": "9a35e5fd-a2a9-4b54-8e8a-37372c3c248d",
   *             "first_name": "Mervin",
   *             "middle_name": null,
   *             "last_name": "Tan",
   *             "email": "mervin@adaptels.com",
   *             "mobile_number": null,
   *             "date_of_birth": null,
   *             "gender": null,
   *             "nationality": null,
   *             "ordinarily_resident_location": null,
   *             "permanent_resident": null,
   *             "buyer_type": "",
   *             "status": "active",
   *             "created_by": "9a35e5fd-a2a9-4b54-8e8a-37372c3c248d",
   *             "created_date": "2021-03-15T02:09:08.000Z",
   *             "updated_by": "9a35e5fd-a2a9-4b54-8e8a-37372c3c248d",
   *             "updated_date": "2021-03-15T02:09:08.000Z"
   *           }
   *         },
   *      },
   *      "shortlisted_properties": [
   *         {
   *           "project": {
   *             "project_id": 95,
   *             "project_name": "Hyde Heritage Thonglor",
   *             "location_address": "1199 Sukhumvit Rd, Khlong Tan Nuea, Watthana, Bangkok",
   *             "location_latitude": "13.7224329183642197",
   *             "location_longitude": "100.5819084302257522",
   *             "location_google_map_url": "https://www.google.com.sg/maps/place/Thao+Dien,+District+2,+Ho+Chi+Minh+City,+Vietnam/@10.8092575,106.7179086,14z"
   *           },
   *           "property_id": 330,
   *           "unit_id": 330,
   *           "unit": {
   *             "unit_type": "3_bedrooms",
   *             "floor": "34",
   *             "sqm": "138.4000",
   *             "bed": "3",
   *             "bath": "3",
   *             "start_price": "1518334.9800",
   *             "currency": "usd",
   *             "weekly_rent": "1080.3537",
   *             "rental_yield": "3.7000",
   *             "parking_lots": "0",
   *             "direction_facing": "south",
   *             "images": [
   *               {
   *                 "image_url": "https://content.yourpave.com/wp-content/uploads/2021/04/hyde-heritage-thonglor-3bed-image_1.png",
   *                 "image_mimetype": "image/png",
   *                 "image_id": "331",
   *                 "image_order": "0"
   *               },
   *               {
   *                 "image_url": "https://content.yourpave.com/wp-content/uploads/2021/04/image_3.png",
   *                 "image_mimetype": "image/png",
   *                 "image_id": "311",
   *                 "image_order": "0"
   *               },
   *               {
   *                 "image_url": "https://content.yourpave.com/wp-content/uploads/2021/04/image_4.png",
   *                 "image_mimetype": "image/png",
   *                 "image_id": "310",
   *                 "image_order": "0"
   *               },
   *               {
   *                 "image_url": "https://content.yourpave.com/wp-content/uploads/2021/04/image_2.png",
   *                 "image_mimetype": "image/png",
   *                 "image_id": "308",
   *                 "image_order": "0"
   *               }
   *             ],
   *             "medias": [
   *               {
   *                 "media_type": "video",
   *                 "media_url": "https://www.youtube.com/embed/Js9BmAlazLU",
   *                 "media_title": "youtube video",
   *                 "media_description": ""
   *               },
   *               {
   *                 "media_type": "image",
   *                 "media_url": "https://content.yourpave.com/wp-content/uploads/2021/05/hyde-heritage-thonglor-3bed-image_1.png",
   *                 "media_title": "hyde-heritage-thonglor-3bed-image_1",
   *                 "media_description": ""
   *               }
   *             ]
   *           }
   *         }
   *      ],
   * }
   */
  fastify.route({
    method: 'GET',
    url: '/contact/:permalink/shortlisted_property',
    schema: {
      params: {
        type: 'object',
        required: ['permalink'],
        properties: {
          permalink: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      // get portal for request(as we need to allow CORS to webapp and webapp admin)
      const portal = h.request.getPortal(request);
      try {
        const { permalink } = request.params;
        const contactRecord = await contactController.findOne(
          { permalink },
          {
            include: [
              { model: models.agency, required: true, as: 'agency' },
              {
                model: models.agency_user,
                required: true,
                as: 'agency_user',
                include: [
                  {
                    model: models.user,
                    attributes: {
                      exclude: ['password', 'password_salt'],
                    },
                  },
                ],
              },
            ],
          },
        );
        // if (h.isEmpty(contactRecord)) throw new Error(`${request.url}: contact not found by permalink '${permalink}'`);
        if (h.isEmpty(contactRecord)) {
          h.api.createResponse(
            request,
            reply,
            200,
            {},
            '2-contact-1630304759',
            {
              portal,
            },
          );
        } else {
          const shortlistedProperties = [];
          const shortlistedPropertyRecords =
            await shortListedPropertyController.findAll(
              { contact_fk: contactRecord.contact_id },
              {
                include: [
                  {
                    model: models.project_property,
                    required: true,
                    where: { is_deleted: 0 },
                    include: [
                      { model: models.project, required: false },
                      {
                        model: models.project_media_property,
                        required: false,
                        include: [
                          {
                            model: models.project_media,
                            include: [{ model: models.project_media_tag }],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            );
          for (let j = 0; j < shortlistedPropertyRecords.length; j++) {
            const shortlistedPropertyRecord = shortlistedPropertyRecords[j];
            let projectUnit = shortlistedPropertyRecord.project_property;
            // Format project property for frontend
            projectUnit =
              projectPropertyController.formatProjectPropertyContent(
                projectUnit.dataValues,
              );
            shortlistedProperties.push(
              Object.assign({}, projectUnit, {
                shortlisted_property_id:
                  shortlistedPropertyRecord.shortlisted_property_id,
                property_rating: shortlistedPropertyRecord.property_rating,
                is_bookmarked: shortlistedPropertyRecord.is_bookmarked,
                display_order: shortlistedPropertyRecord.display_order,
                bookmark_date:
                  shortlistedPropertyRecord.dataValues.bookmark_date_raw,
                created_date:
                  shortlistedPropertyRecord.dataValues.created_date_raw,
              }),
            );
          }
          h.api.createResponse(
            request,
            reply,
            200,
            {
              contact: contactRecord,
              shortlisted_properties: shortlistedProperties,
            },
            '1-contact-1621560037508',
            { portal },
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${request.url}: failed to retrieve contact with shortlisted property`,
          { err },
        );
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-contact-1621560006601',
          { portal },
        );
      }
    },
  });

  /**
   * @api {post} /v1/contact Create contact
   * @apiName ContactCreate
   * @apiVersion 1.0.0
   * @apiGroup Contact
   * @apiUse ServerError
   *
   * @apiParam {string} first_name First Name
   * @apiParam {string} last_name Last Name
   * @apiParam {string} email Sub Email
   * @apiParam {string} mobile_number Mobile Number
   * @apiParam {string} permalink Permalink
   * @apiParam {string} profile_picture_url Profile Picture
   * @apiParam {string} agency_fk Agency ID
   * @apiParam {string} property_id Property ID being shortlisted
   * @apiParam {number} property_rating Rating of shortlisted property
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
   *      "contact_id": "1234",
   *      "shortlisted_property_id": "5678"
   * }
   */
  fastify.route({
    method: 'POST',
    url: '/contact',
    schema: {
      body: {
        type: 'object',
        required: [
          'first_name',
          'last_name',
          'email',
          'mobile_number',
          'property_id',
        ],
        properties: {
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          email: { type: 'string' },
          mobile_number: { type: 'string' },
          permalink: { type: 'string' },
          profile_picture_url: { type: 'string' },
          agency_fk: { type: 'string' },
          property_id: { type: 'string' },
          property_rating: { type: 'integer' },
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
            shortlisted_property_id: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      // get portal for request(as we need to allow CORS to webapp and webapp admin
      const portal = h.request.getPortal(request);

      try {
        const {
          first_name,
          last_name,
          email,
          mobile_number,
          permalink,
          agency_fk,
          property_id,
          property_rating,
          profile_picture_url,
        } = request.body;
        const contactRecord = await contactController.findOne({ email });

        // Check if contact record already exist base on email
        if (h.general.isEmpty(contactRecord)) {
          const { contact_id, shortlisted_property_id } =
            await h.database.transaction(async (transaction) => {
              // Create contact record
              const contact_id = await contactController.create(
                {
                  first_name,
                  last_name,
                  email,
                  mobile_number,
                  permalink,
                  profile_picture_url,
                  agency_fk,
                },
                { transaction },
              );
              // Create short listed property record
              const shortlisted_property_id =
                await shortListedPropertyController.create(
                  {
                    property_fk: property_id,
                    contact_fk: contact_id,
                    property_rating: property_rating || 0,
                    created_by: contact_id,
                  },
                  { transaction },
                );
              return { contact_id, shortlisted_property_id };
            });
          h.api.createResponse(
            request,
            reply,
            200,
            { contact_id, shortlisted_property_id },
            '1-contact-1620396460',
            { portal },
          );
        }
        if (!h.isEmpty(contactRecord)) {
          // Check if shortlisted property is already shortlisted to contact
          const shortListedPropertyRecord =
            await shortListedPropertyController.findOne({
              property_fk: property_id,
              contact_fk: contactRecord.contact_id,
            });
          // Create shortlisted property if it does not exist
          if (h.general.isEmpty(shortListedPropertyRecord)) {
            const { contact_id, shortlisted_property_id } =
              await h.database.transaction(async (transaction) => {
                const shortlisted_property_id =
                  await shortListedPropertyController.create(
                    {
                      property_fk: property_id,
                      contact_fk: contactRecord.contact_id,
                      property_rating: property_rating || 0,
                      created_by: contactRecord.contact_id,
                    },
                    { transaction },
                  );
                return {
                  contact_id: contactRecord.contact_id,
                  shortlisted_property_id,
                };
              });
            h.api.createResponse(
              request,
              reply,
              200,
              { contact_id, shortlisted_property_id },
              '1-contact-1620800584',
              { portal },
            );
          } else {
            // Contact and shortlisted property record already exist
            console.log(
              `${request.url}: contact and shortlisted property already exist.`,
              { contactRecord },
            );
            h.api.createResponse(
              request,
              reply,
              409,
              {},
              '2-contact-1620800740',
              {
                portal,
              },
            );
          }
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
   * @api {post} /v1/contact Proposal Opened
   * @apiName Proposal Opened
   * @apiVersion 1.0.0
   * @apiGroup Contact
   * @apiUse ServerError
   *
   * @apiParam {string} first_name First Name
   * @apiParam {string} last_name Last Name
   * @apiParam {string} email Sub Email
   * @apiParam {string} mobile_number Mobile Number
   * @apiParam {string} permalink Permalink
   * @apiParam {string} profile_picture_url Profile Picture
   * @apiParam {string} agency_fk Agency ID
   * @apiParam {string} property_id Property ID being shortlisted
   * @apiParam {number} property_rating Rating of shortlisted property
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
   *      "contact_id": "1234",
   *      "shortlisted_property_id": "5678"
   * }
   */
  fastify.route({
    method: 'PUT',
    url: '/contact/:permalink/open',
    schema: {
      params: {
        type: 'object',
        required: ['permalink'],
        properties: {
          permalink: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            permalink: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { permalink } = request.params;
      const portal = h.request.getPortal(request);
      try {
        const { permalink } = request.params;
        const contactRecord = await contactController.findOne(
          { permalink },
          {
            include: [
              { model: models.agency, required: true, as: 'agency' },
              {
                model: models.agency_user,
                required: true,
                as: 'agency_user',
              },
            ],
          },
        );

        if (h.isEmpty(contactRecord)) {
          h.api.createResponse(
            request,
            reply,
            200,
            {},
            '2-contact-1630304759',
            {
              portal,
            },
          );
        } else {
          const shortlistedProjectRecords =
            await shortListedProjectController.findAll(
              {
                contact_fk: contactRecord.contact_id,
                is_deleted: 0,
                is_opened: 0,
              },
              {
                include: [
                  {
                    model: models.project,
                    required: false,
                  },
                ],
              },
            );
          let shortlistedPropertyRecords = {};
          // To handle permalinks with shortlisted_properties but no shortlisted_projects
          if (h.isEmpty(shortlistedProjectRecords)) {
            shortlistedPropertyRecords =
              await shortListedPropertyController.findAll(
                {
                  contact_fk: contactRecord.contact_id,
                  is_deleted: 0,
                  is_opened: 0,
                },
                {
                  include: [
                    {
                      model: models.project_property,
                      required: true,
                      where: { is_deleted: 0 },
                      include: [
                        { model: models.project, required: false },
                        {
                          model: models.project_media_property,
                          required: false,
                        },
                      ],
                    },
                  ],
                },
              );
          }
          // for the case when we have shortlisted_projects but not shortlisted properties
          if (h.isEmpty(shortlistedPropertyRecords)) {
            shortlistedPropertyRecords =
              await shortListedPropertyController.findAll(
                {
                  contact_fk: contactRecord.contact_id,
                  is_deleted: 0,
                  is_opened: 0,
                },
                {
                  include: [
                    {
                      model: models.project_property,
                      required: true,
                      where: { is_deleted: 0 },
                      include: [{ model: models.project, required: false }],
                    },
                  ],
                },
              );
          }

          const parsedShortlistedProperties =
            await shortListedPropertyController.getShortlistedProperties(
              shortlistedPropertyRecords,
            );

          const shortlistedProjectIds = shortlistedProjectRecords.map((m) => {
            return m.shortlisted_project_id;
          });

          const shortlistedProperties = parsedShortlistedProperties.map(
            (m) => m.shortlisted_property_id,
          );

          // Set Shortlisted projects as opened
          if (shortlistedProjectIds.length > 0) {
            await h.database.transaction(async (transaction) => {
              await shortListedProjectController.tagOpenShortlistedProjects(
                shortlistedProjectIds,
                { transaction },
              );
            });
          }

          // Set Shortlisted properties as opened
          if (shortlistedProperties.length > 0) {
            const shortlistedPropertyIds = shortlistedProperties.flat();
            await h.database.transaction(async (transaction) => {
              await shortListedPropertyController.tagOpenShortlistedProperties(
                shortlistedPropertyIds,
                { transaction },
              );
            });
          }
        }

        h.api.createResponse(
          request,
          reply,
          200,
          { portal },
          '1-contact-activity-1652073666416',
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(`${request.url}: update to create contact properties.`, {
          err,
        });
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '2-contact-activity-1652073666416',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/contact/cta1',
    schema: {
      body: {
        type: 'object',
        required: ['contact_id', 'agency_id'],
        properties: {
          contact_id: { type: 'string' },
          agency_id: { type: 'string' },
        },
      },
    },
    handler: async (request, response) => {
      const portal = h.request.getPortal(request);
      const transaction = await models.sequelize.transaction();
      try {
        const { contact_id, agency_id } = request.body;
        const appsync = await c.appSyncCredentials.findOne({
          status: 'active',
        });
        const { api_key } = appsync;

        const messageTrackerEntry =
          await whatsAppMessageTrackerController.findOne(
            {
              contact_fk: contact_id,
              agency_fk: agency_id,
              tracker_type: 'main',
            },
            { order: [['created_date', 'DESC']] },
          );

        const contactRecord = await contactController.findOne({ contact_id });

        const agency_user = await agencyUserController.findOne(
          { agency_user_id: contactRecord.agency_user_fk },
          {
            include: {
              model: models.user,
              required: true,
            },
          },
        );

        let fullName = '';

        if (contactRecord.first_name && contactRecord.last_name) {
          fullName = contactRecord.first_name.concat(
            ' ',
            contactRecord.last_name,
          );
        } else if (contactRecord.first_name) {
          fullName = contactRecord.first_name;
        } else if (contactRecord.last_name) {
          fullName = contactRecord.last_name;
        } else {
          fullName = 'Contact';
        }

        let eventDetails;
        if (!h.isEmpty(messageTrackerEntry)) {
          eventDetails = await agencyCampaignEventDetailsController.findOne(
            {
              agency_fk: agency_id,
              status: 'active',
              tracker_ref_name: messageTrackerEntry?.tracker_ref_name,
            },
            { order: [['created_date', 'DESC']] },
          );
        } else {
          eventDetails = await agencyCampaignEventDetailsController.findOne(
            {
              agency_fk: agency_id,
              status: 'active',
              tracker_ref_name: null,
            },
            { order: [['created_date', 'DESC']] },
          );
        }

        const shortlistedProjectRecords =
          await shortListedProjectController.findAll(
            { contact_fk: contact_id, is_deleted: false },
            {
              include: [
                {
                  model: models.project,
                  required: true,
                },
              ],
            },
          );

        const shortListedProjectNames = shortlistedProjectRecords.map((m) => {
          return m.project.name;
        });

        const campaign_cta = await models.campaign_cta.findOne({
          where: {
            campaign_tracker_ref_name: messageTrackerEntry?.tracker_ref_name,
          },
        });

        h.whatsapp.notifyMessageInteractionCTA1({
          agency_id: agency_id,
          agent_name: agency_user.user.first_name,
          agent_email: agency_user.user.email,
          additional_emails:
            campaign_cta?.campaign_notification_additional_recipients,
          contact_name: fullName,
          campaign: eventDetails?.campaign,
          event_details: eventDetails?.event_details,
          wa_link: `https://wa.me/${contactRecord.mobile_number}`,
          with_event_details: !h.isEmpty(eventDetails),
          shortlisted_projects: shortListedProjectNames,
          permalink_template: contactRecord.permalink_template,
        });

        if (!h.isEmpty(messageTrackerEntry)) {
          const campaignCTARecord = await models.campaign_cta.findOne({
            where: {
              campaign_tracker_ref_name: messageTrackerEntry?.tracker_ref_name,
            },
          });

          const created_date = new Date();

          const options = { day: 'numeric', month: 'short', year: 'numeric' };
          const date = new Date(created_date);
          const formattedDate = date.toLocaleDateString('en-US', options);

          const timeOptions = {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          };
          const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
          const currentTimestamp = Math.floor(Date.now() / 1000);
          const result = await whatsAppChatController.create(
            {
              campaign_name: messageTrackerEntry?.campaign_name,
              agency_fk: agency_id,
              agency_user_fk: messageTrackerEntry?.agency_user_fk,
              contact_fk: contact_id,
              msg_id: messageTrackerEntry?.msg_id,
              msg_body: campaignCTARecord?.cta_1,
              msg_type: 'button',
              original_event_id: 'web_app_event',
              msg_timestamp: currentTimestamp,
              sender_number: messageTrackerEntry?.sender_number,
              sender_url: messageTrackerEntry?.sender_url,
              receiver_number: messageTrackerEntry?.receiver_number,
              receiver_url: messageTrackerEntry?.receiver_url,
              delivered: 1,
              sent: 1,
              failed: 0,
              read: 1,
              created_date: created_date,
            },
            { transaction },
          );
          await h.appsync.sendGraphQLNotification(api_key, {
            platform: 'whatsapp',
            campaign_name: messageTrackerEntry?.campaign_name,
            agency_fk: agency_id,
            agency_user_fk: messageTrackerEntry?.agency_user_fk,
            contact_fk: contact_id,
            msg_id: messageTrackerEntry?.msg_id,
            msg_body: campaignCTARecord?.cta_1,
            msg_type: 'button',
            original_event_id: 'web_app_event',
            msg_timestamp: currentTimestamp,
            sender_number: messageTrackerEntry?.sender_number,
            sender_url: messageTrackerEntry?.sender_url,
            receiver_number: messageTrackerEntry?.receiver_number,
            receiver_url: messageTrackerEntry?.receiver_url,
            delivered: 1,
            sent: 1,
            failed: 0,
            read: 1,
            reply_to_event_id: null,
            reply_to_content: null,
            reply_to_msg_type: null,
            reply_to_file_name: null,
            reply_to_contact_id: null,
            broadcast_date: new Date(),
            last_msg_date: new Date(),
            created_date_raw: created_date,
            created_date: `${formattedDate} ${formattedTime}`,
          });

          await models.whatsapp_message_tracker.update(
            {
              replied: 1,
            },
            {
              where: {
                tracker_ref_name: messageTrackerEntry?.tracker_ref_name,
                sender_number: messageTrackerEntry?.sender_number,
                receiver_number: messageTrackerEntry?.receiver_number,
              },
              transaction,
            },
          );

          await models.unified_inbox.update(
            {
              replied: 1,
              last_msg_date: new Date(),
              msg_type: 'button',
              msg_body: campaignCTARecord?.cta_1,
              updated_date: new Date(),
            },
            {
              where: {
                sender: messageTrackerEntry?.sender_number,
                receiver: messageTrackerEntry?.receiver_number,
                msg_platform: 'whatsapp',
              },
              transaction,
            },
          );

          const agency_waba_config =
            await agencyWhatsAppConfigController.findOne({
              agency_fk: agency_id,
              waba_number: messageTrackerEntry?.sender_number,
            });

          const { agency_whatsapp_api_token, agency_whatsapp_api_secret } =
            agency_waba_config;

          const api_credentials = Buffer.from(
            `${agency_whatsapp_api_token}:${agency_whatsapp_api_secret}`,
            'utf8',
          ).toString('base64');

          const receivers = [
            {
              name: 'name',
              address: `${messageTrackerEntry?.receiver_number}`,
              Connector: `${messageTrackerEntry?.receiver_number}`,
              type: 'individual',
            },
          ];

          const { whatsapp_config } = await models.agency_config.findOne({
            where: { agency_fk: agency_id },
          });

          const config = JSON.parse(whatsapp_config);
          const quick_replies = config.quick_replies;

          const campaign_cta = await models.campaign_cta.findOne({
            where: {
              campaign_tracker_ref_name: messageTrackerEntry?.tracker_ref_name,
            },
            transaction,
          });

          const auto_response = campaign_cta?.cta_1_response;
          const parts = [];
          parts.push({
            id: '1',
            contentType: 'text/plain',
            data: `${auto_response}`,
            size: 1000,
            type: 'body',
            sort: 0,
          });

          console.log({
            action: 'sending auto response',
            data: {
              mobile_number: messageTrackerEntry?.receiver_number,
              parts,
              api_credentials,
            },
          });

          const environment = config.environment;

          const sendingResult = await h.whatsapp.sendAutoResponseMessage({
            mobile_number: messageTrackerEntry?.receiver_number,
            parts,
            receivers,
            api_credentials,
            environment,
            log: null,
          });

          if (!h.isEmpty(sendingResult.original_event_id)) {
            const currentTimestamp = Math.floor(new Date().getTime() / 1000);
            const receiver_url = messageTrackerEntry?.receiver_url;
            await whatsAppChatController.create(
              {
                campaign_name: messageTrackerEntry?.campaign_name,
                msg_id: messageTrackerEntry?.whatsapp_message_tracker_id,
                msg_timestamp: currentTimestamp,
                sender_number: messageTrackerEntry?.sender_number,
                sender_url: messageTrackerEntry?.sender_url,
                receiver_number: messageTrackerEntry?.receiver_number,
                receiver_url: receiver_url.split('?')[0],
                agency_fk: agency_id,
                agency_user_fk: contactRecord?.agency_user_fk,
                contact_fk: messageTrackerEntry?.contact_fk,
                original_event_id: sendingResult.original_event_id,
                msg_type: 'frompave',
                msg_body: `${auto_response}  ok`,
              },
              { transaction },
            );
          }
        }

        await models.contact.update(
          {
            is_general_enquiry: 1,
          },
          {
            where: {
              contact_id: contact_id,
            },
          },
        );

        await models.contact_lead_score.create(
          {
            contact_lead_score_id: h.general.generateId(),
            contact_fk: contact_id,
            score: 50,
          },
          { transaction },
        );

        const activity_ip = h.request.getIp(request);
        const view_on_device = h.notEmpty(request.headers['user-agent'])
          ? request.headers['user-agent']
          : '';

        await models.contact_activity.create(
          {
            activity_type: constant.CONTACT.ACTIVITY.TYPE.CLICKED_ON_WA_BTN_1,
            activity_meta: '',
            activity_ip: activity_ip,
            viewed_on_device: view_on_device,
            activity_date: h.date.getSqlCurrentDate(),
            created_by: contact_id,
            contact_fk: contact_id,
          },
          { transaction },
        );

        await models.contact.increment(
          {
            lead_score: 50,
            last_24_hour_lead_score: 50,
            last_24_hour_lead_score_diff: 50,
          },
          {
            where: {
              contact_id: contact_id,
            },
            transaction,
          },
        );

        await transaction.commit();

        h.api.createResponse(
          request,
          response,
          200,
          {
            success: 'ok',
            tracker_ref_name: messageTrackerEntry?.tracker_ref_name,
          },
          '1-web-cta1-click-1663834299369',
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
          '2-web-cta1-click-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/contact/web_cta1_confirmed/:contact_id',
    schema: {
      params: {
        type: 'object',
        required: ['contact_id'],
        properties: {
          contact_id: { type: 'string' },
          tracker_ref_name: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const portal = h.request.getPortal(request);
      try {
        const { contact_id } = request.params;

        const contactRecord = await contactController.findOne({ contact_id });

        const messageTrackerEntry =
          await whatsAppMessageTrackerController.findOne(
            {
              contact_fk: contact_id,
              agency_fk: contactRecord?.agency_fk,
              tracker_type: 'main',
            },
            { order: [['created_date', 'DESC']] },
          );

        if (messageTrackerEntry) {
          const isGeneralInquiry = contactRecord?.is_general_enquiry;
          h.api.createResponse(
            request,
            reply,
            200,
            {
              clicked: isGeneralInquiry,
              hasCampaign: true,
            },
            '1-web-cta1-click-confirmed-1663834299369',
            { portal },
          );
        } else {
          const isGeneralInquiry = contactRecord?.is_general_enquiry;
          h.api.createResponse(
            request,
            reply,
            200,
            {
              clicked: isGeneralInquiry,
              hasCampaign: false,
            },
            '1-web-cta1-click-confirmed-1663834299369',
            { portal },
          );
        }
      } catch (err) {
        Sentry.captureException(err);
        console.log(
          `${request.url}: failed to retrieve contact with shortlisted property`,
          { err },
        );
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '3-web-cta1-click-confirmed-1663834299369',
          { portal },
        );
      }
    },
  });

  next();
};
