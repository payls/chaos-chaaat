const Sentry = require('@sentry/node');
const constant = require('../../../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;
const h = require('../../../helpers');
const { catchError } = require('../../../helpers/error');
const userMiddleware = require('../../../middlewares/user');
const NonStaffShortlistedProjectSettingProposalTemplateService = require('../../../services/shortlistedProjectSettingProposalTemplate');

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'POST',
    url: '/staff/shortlisted-project-proposal-template/:shortlisted_project_proposal_template_id/setting',
    schema: {
      params: {
        type: 'object',
        required: ['shortlisted_project_proposal_template_id'],
        properties: {
          shortlisted_project_proposal_template_id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          media_setting_image: { type: 'boolean' },
          media_setting_video: { type: 'boolean' },
          media_setting_floor_plan: { type: 'boolean' },
          media_setting_brocure: { type: 'boolean' },
          media_setting_factsheet: { type: 'boolean' },
          media_setting_render_3d: { type: 'boolean' },
          info_setting_key_stats: { type: 'boolean' },
          info_setting_project_highlights: { type: 'boolean' },
          info_setting_why_invest: { type: 'boolean' },
          info_setting_shopping: { type: 'boolean' },
          info_setting_transport: { type: 'boolean' },
          info_setting_education: { type: 'boolean' },
          shortlisted_property_setting_proposal_templates: { type: 'array' },
          hidden_media: { type: 'string' },
          media_order: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            message_code: { type: 'string' },
            shortlisted_project_proposal_template_id: { type: 'string' },
          },
        },
      },
    },
    preValidation: async (req, res) => {
      await userMiddleware.isLoggedIn(req, res);
      await userMiddleware.hasAccessToStaffPortal(req, res);
    },
    handler: async (req, res) => {
      const { shortlisted_project_proposal_template_id } = req.params;

      const nonStaffShortlistedProjectSettingProposalTemplateService =
        new NonStaffShortlistedProjectSettingProposalTemplateService();
      const [err] = await h.database.transaction(async (transaction) => {
        nonStaffShortlistedProjectSettingProposalTemplateService.setDbTransaction(
          transaction,
        );
        return catchError(
          nonStaffShortlistedProjectSettingProposalTemplateService.upsertShorlistedProjectSettingProposalTemplates(
            req,
          ),
        );
      });

      if (err) {
        Sentry.captureException(err);
        req.log.error({
          url: req.url,
          error: err,
        });
        console.log(err);
        return h.api.createResponse(
          req,
          res,
          500,
          {},
          '2-project-setting-1653901822616',
          { portal },
        );
      } else {
        const message_code = '1-project-setting-1653901822616';
        const message = h.general.getMessageByCode(message_code);
        const statusCode = 201;
        const response = {
          status: statusCode,
          message,
          message_code,
          shortlisted_project_proposal_template_id,
        };
        return res.code(statusCode).send(response);
      }
    },
  });

  next();
};
