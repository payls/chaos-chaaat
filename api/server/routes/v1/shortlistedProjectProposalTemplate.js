const Sentry = require('@sentry/node');
const models = require('../../models');
const h = require('../../helpers');
const NonStaffShortlistedProjectService = require('../../services/shortlistedProject');
const NonStaffShortlistedProjectSettingProposalTemplateService = require('../../services/shortlistedProjectSettingProposalTemplate');
const { catchError } = require('../../helpers/error');
const shortListedProjectController =
  require('../../controllers/shortlistedProject').makeShortListedProjectController(
    models,
  );
const shortListedProjectPropertyTemplateController =
  require('../../controllers/shortlistedPropertyProposalTemplate').makeController(
    models,
  );

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'GET',
    url: '/shortlisted-project-proposal-template/:shortlisted_project_proposal_template_id/setting',
    schema: {
      params: {
        type: 'object',
        required: ['shortlisted_project_proposal_template_id'],
        properties: {
          shortlisted_project_proposal_template_id: { type: 'string' },
        },
      },
    },
    handler: async (req, res) => {
      const nonStaffShortlistedProjectProposalSettingService =
        new NonStaffShortlistedProjectSettingProposalTemplateService();
      const [err, shortlistedProjectSettingProposalTemplate] =
        await h.database.transaction(async (transaction) => {
          nonStaffShortlistedProjectProposalSettingService.setDbTransaction(
            transaction,
          );
          return catchError(
            nonStaffShortlistedProjectProposalSettingService.getShorlistedProjectSettingProposalTemplates(
              req,
            ),
          );
        });
      if (err) {
        req.log.error({
          url: req.url,
          error: err,
        });

        return h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-project-setting-proposal-template-1663834299369',
        );
      }

      const message_code = '1-project-setting-proposal-template-1663834299369';
      const message = h.general.getMessageByCode(message_code);
      return res.code(200).send({
        status: 200,
        message,
        message_code,
        shortlistedProjectSettingProposalTemplate,
      });
    },
  });

  fastify.route({
    method: 'GET',
    url: '/shortlisted-project-proposal-template/:shortlisted_project_proposal_template_id/properties',
    schema: {
      params: {
        type: 'object',
        required: ['shortlisted_project_proposal_template_id'],
        properties: {
          shortlisted_project_proposal_template_id: { type: 'string' },
        },
      },
    },
    handler: async (req, res) => {
      const portal = h.request.getPortal(req);
      const { shortlisted_project_proposal_template_id } = req.params;

      try {
        const shortlistedProjectPropertyProposalTemplateRecords =
          await shortListedProjectPropertyTemplateController.findAll({
            proposal_template_fk: shortlisted_project_proposal_template_id,
          });

        if (h.isEmpty(shortlistedProjectPropertyProposalTemplateRecords)) {
          return h.api.createResponse(
            req,
            res,
            200,
            {},
            '2-project-proposal-property-template-1663834299369',
            {
              portal,
            },
          );
        } else {
          const message_code =
            '1-project-proposal-property-template-1663834299369';
          const message = h.general.getMessageByCode(message_code);
          return res.code(200).send({
            status: 200,
            message,
            message_code,
            shortlistedProjectPropertyProposalTemplateRecords,
          });
        }
      } catch (err) {
        Sentry.captureException(err);
        h.api.createResponse(
          req,
          res,
          500,
          {},
          '3-project-proposal-property-template-1663834299369',
          { portal },
        );
      }
    },
  });

  next();
};
