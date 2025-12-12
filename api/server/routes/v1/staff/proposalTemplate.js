const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const models = require('../../../models');
const { Op } = require('sequelize');
const h = require('../../../helpers');
const userMiddleware = require('../../../middlewares/user');
const proposalTemplateController =
  require('../../../controllers/proposalTemplate').makeController(models);
const shortlistedProjectProposalTemplateCtl =
  require('../../../controllers/shortlistedProjectProposalTemplate').makeController(
    models,
  );
const shortlistedPropertyProposalTemplateCtl =
  require('../../../controllers/shortlistedPropertyProposalTemplate').makeController(
    models,
  );
const shortlistedPropertyCommentEmailController =
  require('../../../controllers/shortlistedPropertyCommentEmail').makeShortlistedPropertyCommentEmailController(
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

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'GET',
    url: '/staff/proposal-template',
    schema: {
      qs: {
        type: 'object',
        required: ['agency_id'],
        properties: {
          agency_id: { type: 'string' },
          is_draft: { type: 'boolean' },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      try {
        const { is_draft, agency_id } = request.query;

        const where = {
          agency_fk: agency_id,
        };

        if (typeof is_draft === 'boolean') {
          where.is_draft = is_draft;
        }

        const include = [
          { model: models.shortlisted_project_proposal_template },
          { model: models.shortlisted_property_proposal_template },
          { model: models.agency },
        ];

        const proposalTemplates = await proposalTemplateController.findAll(
          where,
          { include },
        );

        h.api.createResponse(
          request,
          response,
          200,
          { proposalTemplates },
          '1-get-proposal-templates-1663834299369',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        // console.log(
        //   `${request.url}: user failed to retrieve proposal template list`,
        //   {
        //     err,
        //   },
        // );
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-get-proposal-templates-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/staff/proposal-template',
    schema: {
      body: {
        type: 'object',
        properties: {
          agency_id: { type: 'string' },
          name: { type: 'string' },
          proposal_template_id: { type: 'string' },
          email_subject: { type: 'string' },
          email_body: { type: 'string' },
          is_draft: { type: 'boolean' },
          project_ids: { type: 'array' },
          unit_ids: { type: 'array' },
        },
      },
    },
    preValidation: async (request, reply) => {
      await userMiddleware.isLoggedIn(request, reply);
      await userMiddleware.hasAccessToStaffPortal(request, reply);
    },
    handler: async (request, response) => {
      const {
        proposal_template_id,
        agency_id: agency_fk,
        name,
        is_draft,
        email_subject,
        email_body,
        project_ids,
        unit_ids,
      } = request.body;

      const { user_id } = h.user.getCurrentUser(request);

      const transaction = await models.sequelize.transaction();

      try {
        let proposalTemplateId;
        if (!proposal_template_id) {
          proposalTemplateId = await proposalTemplateController.create(
            {
              name,
              agency_fk,
              email_subject,
              email_body,
            },
            { transaction },
          );
        } else {
          proposalTemplateId = await proposalTemplateController.update(
            proposal_template_id,
            { name, is_draft, email_subject, email_body },
            user_id,
            { transaction },
          );
        }

        // update or create projects and units
        if (project_ids) {
          // delete all shortlisted project for proposal template
          await shortlistedProjectProposalTemplateCtl.destroyAll(
            {
              proposal_template_fk: proposalTemplateId,
            },
            { transaction },
          );

          for (const project of project_ids) {
            await shortlistedProjectProposalTemplateCtl.create(
              {
                project_fk: project.project_id,
                display_order: project.display_order,
                proposal_template_fk: proposalTemplateId,
                is_deleted: 0,
                created_by: user_id,
              },
              { transaction },
            );
          }
        }

        if (unit_ids) {
          // delete all shortlisted property for proposal template
          await shortlistedPropertyProposalTemplateCtl.destroyAll(
            {
              proposal_template_fk: proposalTemplateId,
            },
            { transaction },
          );

          for (const project_property of unit_ids) {
            await shortlistedPropertyProposalTemplateCtl.create(
              {
                project_property_fk: project_property.project_property_id,
                proposal_template_fk: proposalTemplateId,
                created_by: user_id,
                display_order: project_property.display_order,
                is_deleted: 0,
              },
              { transaction },
            );
          }
        }

        await transaction.commit();
        const include = [
          { model: models.shortlisted_project_proposal_template },
          { model: models.shortlisted_property_proposal_template },
          { model: models.agency },
        ];
        const proposal_template = await proposalTemplateController.findOne(
          {
            proposal_template_id: proposalTemplateId,
          },
          { include },
        );
        h.api.createResponse(
          request,
          response,
          200,
          { proposal_template },
          '1-create-proposal-templates-1663834299369',
          { portal },
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
        await transaction.rollback();
        h.api.createResponse(
          request,
          response,
          500,
          {},
          '2-create-proposal-templates-1663834299369',
          {
            portal,
          },
        );
      }
    },
  });

  next();
};
