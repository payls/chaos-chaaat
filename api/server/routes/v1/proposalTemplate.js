const Sentry = require('@sentry/node');
const models = require('../../models');
const h = require('../../helpers');
const constant = require('../../constants/constant.json');
const proposalTemplateCtl =
  require('../../controllers/proposalTemplate').makeController(models);
const shortlistedProjectProposalTemplateCtl =
  require('../../controllers/shortlistedProjectProposalTemplate').makeController(
    models,
  );
const shortlistedPropertyProposalTemplateCtl =
  require('../../controllers/shortlistedPropertyProposalTemplate').makeController(
    models,
  );

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'GET',
    url: '/proposal-template/:proposal_template_id/shortlisted_project',
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
      const { proposal_template_id } = request.params;
      try {
        const proposalTemplateRecord = await proposalTemplateCtl.findOne(
          { proposal_template_id },
          {
            include: [{ model: models.agency, required: true, as: 'agency' }],
          },
        );

        if (h.isEmpty(proposalTemplateRecord)) {
          return h.api.createResponse(
            request,
            reply,
            200,
            {},
            '2-proposal-template-1663834299369',
            {
              portal,
            },
          );
        }

        let shortlistedProjectProposalTemplateRecords =
          await shortlistedProjectProposalTemplateCtl.findAll(
            { proposal_template_fk: proposal_template_id },
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

        let shortlistedPropertyProposalTemplateRecords = {};
        // To handle permalinks with shortlisted_properties but no shortlisted_projects
        if (h.isEmpty(shortlistedProjectProposalTemplateRecords)) {
          shortlistedPropertyProposalTemplateRecords =
            await shortlistedPropertyProposalTemplateCtl.findAll(
              { proposal_template_fk: proposal_template_id },
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
          if (h.notEmpty(shortlistedPropertyProposalTemplateRecords)) {
            const tempSelectedProjects = [];
            for (const property of shortlistedPropertyProposalTemplateRecords) {
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
            for (const project_id of tempSelectedProjects) {
              await shortlistedProjectProposalTemplateCtl.create({
                proposal_template_fk: proposal_template_id,
                project_fk: project_id,
                created_by: proposalTemplateRecord.created_by,
                display_order: display_order_count,
              });
              display_order_count += 1;
            }

            // Place newly created shortlisted_projects back into the return obj
            shortlistedProjectProposalTemplateRecords =
              await shortlistedPropertyProposalTemplateCtl.findAll(
                { proposal_template_fk: proposal_template_id },
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
        }

        // for the case when we have shortlisted_projects but not shortlisted properties
        if (h.isEmpty(shortlistedPropertyProposalTemplateRecords)) {
          shortlistedPropertyProposalTemplateRecords =
            await shortlistedPropertyProposalTemplateCtl.findAll(
              { proposal_template_fk: proposal_template_id, is_deleted: 0 },
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

        const parsedShortlistedPropertyProposalTemplate =
          await shortlistedPropertyProposalTemplateCtl.parseShortlistedProperties(
            shortlistedPropertyProposalTemplateRecords,
          );

        await shortlistedProjectProposalTemplateCtl.insertShortlistedProperties(
          parsedShortlistedPropertyProposalTemplate,
          shortlistedProjectProposalTemplateRecords,
        );
        h.api.createResponse(
          request,
          reply,
          200,
          {
            proposal_template: proposalTemplateRecord,
            shortlisted_project_proposal_templates:
              shortlistedProjectProposalTemplateRecords,
          },
          '1-proposal-template-1663834299369',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(
          request,
          reply,
          500,
          {},
          '3-proposal-template-1663834299369',
          { portal },
        );
      }
    },
  });
  next();
};
