const Sentry = require('@sentry/node');
const models = require('../../models');
const h = require('../../helpers');
const constant = require('../../constants/constant.json');
const contactController =
  require('../../controllers/contact').makeContactController(models);
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

const shortListedProjectProposalTemplateController =
  require('../../controllers/shortlistedProjectProposalTemplate').makeController(
    models,
  );

const shortListedPropertyProposalTemplateController =
  require('../../controllers/shortlistedPropertyProposalTemplate').makeController(
    models,
  );

const featureController =
  require('../../controllers/feature').makeFeatureController(models);

const agencyController =
  require('../../controllers/agency').makeAgencyController(models);

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
        request.log.info({
          part: 1,
          date: new Date(),
        });
        const { permalink } = request.params;
        let contactRecord = await contactController.findOne(
          { permalink },
          {
            include: [
              { model: models.agency, required: true, as: 'agency' },
              {
                model: models.agency_user,
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

        request.log.info({
          part: 2,
          date: new Date(),
        });

        contactRecord =
          contactRecord && contactRecord.toJSON
            ? contactRecord.toJSON()
            : contactRecord;

        if (h.isEmpty(contactRecord) || h.isEmpty(contactRecord.agency_user)) {
          return h.api.createResponse(
            request,
            reply,
            200,
            {},
            '2-contact-1630304759',
            {
              portal,
            },
          );
        }
        let shortlistedProjectRecords =
          await shortListedProjectController.findAll(
            { contact_fk: contactRecord.contact_id, is_deleted: 0 },
            {
              include: [
                {
                  model: models.project,
                  required: false,
                  where: { is_deleted: 0 },
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
        request.log.info({
          part: 3,
          date: new Date(),
        });
        // To handle permalinks with shortlisted_properties but no shortlisted_projects
        if (h.isEmpty(shortlistedProjectRecords)) {
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
                      { model: models.project, required: false, is_deleted: 0 },
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
                tempSelectedProjects.push(property.project_property.project_fk);
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

        request.log.info({
          part: 4,
          date: new Date(),
        });
        // for the case when we have shortlisted_projects but not shortlisted properties
        if (h.isEmpty(shortlistedPropertyRecords)) {
          shortlistedPropertyRecords =
            await shortListedPropertyController.findAll(
              { contact_fk: contactRecord.contact_id, is_deleted: 0 },
              {
                include: [
                  {
                    model: models.project_property,
                    required: false,
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
        request.log.info({
          part: 5,
          date: new Date(),
        });
        const parsedShortlistedProperties =
          await shortListedPropertyController.parseShortlistedProperties(
            shortlistedPropertyRecords,
          );
        request.log.info({
          part: 6,
          date: new Date(),
        });
        await shortListedProjectController.insertShortlistedProperties(
          parsedShortlistedProperties,
          shortlistedProjectRecords,
        );
        request.log.info({
          part: 7,
          date: new Date(),
        });
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

  fastify.route({
    method: 'GET',
    url: '/contact/:permalink/agency',
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
      const portal = h.request.getPortal(request);
      try {
        const { permalink } = request.params;

        let contactRecord = await contactController.findOne(
          { permalink },
          {
            include: [
              { model: models.agency, required: true, as: 'agency' },
              {
                model: models.agency_custom_landing_pages,
                required: false,
                include: [
                  {
                    model: models.landing_page_info,
                    required: false,
                    attributes: [
                      'meta_title',
                      'meta_description',
                      'meta_image',
                    ],
                  },
                ],
              },
            ],
          },
        );

        contactRecord =
          contactRecord && contactRecord.toJSON
            ? contactRecord.toJSON()
            : contactRecord;

        if (h.isEmpty(contactRecord)) {
          return h.api.createResponse(
            request,
            reply,
            200,
            {},
            '2-contact-1630304759',
            {
              portal,
            },
          );
        }

        h.api.createResponse(
          request,
          reply,
          200,
          {
            contact: contactRecord,
            agency: contactRecord.agency,
          },
          '1-contact-1621560037508',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        request.log.info({
          message: `${request.url}: failed to retrieve contact with shortlisted project`,
          err,
        });
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

  fastify.route({
    method: 'GET',
    url: '/contact/:permalink/shortlist-table',
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
      const portal = h.request.getPortal(request);
      try {
        const { permalink } = request.params;

        let contactRecord = await contactController.findOne(
          { permalink },
          {
            include: [{ model: models.agency, required: true, as: 'agency' }],
          },
        );

        contactRecord =
          contactRecord && contactRecord.toJSON
            ? contactRecord.toJSON()
            : contactRecord;

        if (h.isEmpty(contactRecord)) {
          return h.api.createResponse(
            request,
            reply,
            200,
            {},
            '2-contact-1630304759',
            {
              portal,
            },
          );
        }

        let shortlistedProjects = await shortListedProjectController.findAll(
          {
            contact_fk: contactRecord.contact_id,
            is_deleted: 0,
          },
          {
            include: [
              {
                model: models.project,
                where: { is_deleted: 0 },
              },
            ],
          },
        );

        shortlistedProjects =
          shortlistedProjects && shortlistedProjects.toJSON
            ? shortlistedProjects.toJSON()
            : shortlistedProjects;

        let shortlistedProperties = await shortListedPropertyController.findAll(
          {
            contact_fk: contactRecord.contact_id,
            is_deleted: 0,
          },
          {
            include: [
              {
                model: models.project_property,
                required: true,
                where: { is_deleted: 0 },
              },
            ],
          },
        );

        shortlistedProperties =
          shortlistedProperties && shortlistedProperties.toJSON
            ? shortlistedProperties.toJSON()
            : shortlistedProperties;

        h.api.createResponse(
          request,
          reply,
          200,
          {
            shortlisted_projects: shortlistedProjects,
            shotlisted_properties: shortlistedProperties,
          },
          '1-contact-1621560037508',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        request.log.info({
          message: `${request.url}: failed to retrieve contact with shortlisted project`,
          err,
        });
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

  fastify.route({
    method: 'GET',
    url: '/contact/:permalink/agency-user',
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
      const portal = h.request.getPortal(request);
      try {
        const { permalink } = request.params;
        let contactRecord = await contactController.findOne(
          { permalink },
          {
            include: [
              { model: models.agency, required: true, as: 'agency' },
              {
                model: models.agency_user,
                as: 'agency_user',
                include: [
                  {
                    model: models.agency,
                  },
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

        if (h.isEmpty(contactRecord) || h.isEmpty(contactRecord.agency_user)) {
          return h.api.createResponse(
            request,
            reply,
            200,
            {},
            '2-contact-1630304759',
            {
              portal,
            },
          );
        }

        contactRecord =
          contactRecord && contactRecord.toJSON
            ? contactRecord.toJSON()
            : contactRecord;

        const contact = { ...contactRecord };
        const agency_user = contactRecord.agency_user;
        delete contact.agency;
        delete contact.agency_user;

        h.api.createResponse(
          request,
          reply,
          200,
          {
            agency_user,
            contact,
          },
          '1-contact-1621560037508',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        request.log.info({
          message: `${request.url}: failed to retrieve contact with shortlisted project`,
          err,
        });
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

  fastify.route({
    method: 'GET',
    url: '/contact/:proposal_template_id/shortlist-template-table',
    schema: {
      params: {
        type: 'object',
        required: ['proposal_template_id'],
        properties: {
          proposal_template_id: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const portal = h.request.getPortal(request);
      try {
        const { proposal_template_id } = request.params;

        let shortlistedProjects =
          await shortListedProjectProposalTemplateController.findAll(
            {
              proposal_template_fk: proposal_template_id,
              is_deleted: 0,
            },
            {
              include: [
                {
                  model: models.project,
                  where: { is_deleted: 0 },
                },
              ],
            },
          );

        shortlistedProjects =
          shortlistedProjects && shortlistedProjects.toJSON
            ? shortlistedProjects.toJSON()
            : shortlistedProjects;

        let shortlistedProperties =
          await shortListedPropertyProposalTemplateController.findAll(
            {
              proposal_template_fk: proposal_template_id,
              is_deleted: 0,
            },
            {
              include: [
                {
                  model: models.project_property,
                  required: true,
                  where: { is_deleted: 0 },
                },
              ],
            },
          );

        shortlistedProperties =
          shortlistedProperties && shortlistedProperties.toJSON
            ? shortlistedProperties.toJSON()
            : shortlistedProperties;

        h.api.createResponse(
          request,
          reply,
          200,
          {
            shortlisted_projects: shortlistedProjects,
            shotlisted_properties: shortlistedProperties,
          },
          '1-contact-1621560037508',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        request.log.info({
          message: `${request.url}: failed to retrieve contact with shortlisted project`,
          err,
        });
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

  next();
};
