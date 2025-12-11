const uuid = require('uuid');
const h = require('../helpers');
const NonStaffCommon = require('./common');

class NonStaffShortlistedProjectSettingProposalTemplateService extends NonStaffCommon {
  constructor() {
    super();
    this.shortlistedProjectProposalTemplateController =
      require('../controllers/shortlistedProjectProposalTemplate').makeController(
        this.models,
      );
  }

  /**
   * Get Shorlisted Project Setting Proposal Templates
   * @param {FastifyRequest} request
   * @returns {Promise<[]>}
   */
  async getShorlistedProjectSettingProposalTemplates(req) {
    const funcName =
      'NonStaffShortlistedProjectSettingProposalTemplateService.getShorlistedProjectSettingProposalTemplates';
    const { shortlisted_project_proposal_template_id } = req.params;

    try {
      h.validation.requiredParams(funcName, {
        shortlisted_project_proposal_template_id,
      });

      const shortListedProjectSettingProposalTemplate =
        await this.models.shortlisted_project_setting_proposal_template.findOne(
          {
            where: {
              shortlisted_project_proposal_template_fk:
                shortlisted_project_proposal_template_id,
            },
            include: [
              {
                model:
                  this.models.shortlisted_property_setting_proposal_template,
              },
            ],
            transaction: this.dbTransaction,
          },
        );

      return shortListedProjectSettingProposalTemplate;
    } catch (err) {
      req.log.error({
        funcName,
        error: err,
      });
      throw err;
    }
  }

  async upsertShorlistedProjectSettingProposalTemplates(req) {
    const funcName =
      'NonStaffShortlistedProjectSettingProposalTemplateService.upsertShorlistedProjectSettingProposalTemplate';
    const { shortlisted_project_proposal_template_id } = req.params;
    const {
      media_setting_image,
      media_setting_video,
      media_setting_floor_plan,
      media_setting_brocure,
      info_setting_key_stats,
      info_setting_project_highlights,
      info_setting_why_invest,
      info_setting_shopping,
      info_setting_transport,
      info_setting_education,
      hidden_media,
      media_order,
      shortlisted_property_setting_proposal_templates = [],
    } = req.body;
    console.log(req.body);
    try {
      h.validation.requiredParams(funcName, {
        shortlisted_project_proposal_template_id,
      });

      let shortListedProjectSettingProposalTemplate =
        await this.models.shortlisted_project_setting_proposal_template.findOne(
          {
            where: {
              shortlisted_project_proposal_template_fk:
                shortlisted_project_proposal_template_id,
            },
            transaction: this.dbTransaction,
          },
        );

      if (shortListedProjectSettingProposalTemplate) {
        await this.models.shortlisted_project_setting_proposal_template.update(
          {
            media_setting_image,
            media_setting_video,
            media_setting_floor_plan,
            media_setting_brocure,
            info_setting_key_stats,
            info_setting_project_highlights,
            info_setting_why_invest,
            info_setting_shopping,
            info_setting_transport,
            info_setting_education,
            hidden_media,
            media_order,
          },
          {
            where: {
              shortlisted_project_proposal_template_fk:
                shortlisted_project_proposal_template_id,
            },
            transaction: this.dbTransaction,
          },
        );
      } else {
        const shortlisted_project_setting_proposal_template_id =
          h.general.generateId();
        await this.models.shortlisted_project_setting_proposal_template.create(
          {
            shortlisted_project_setting_proposal_template_id,
            shortlisted_project_proposal_template_fk:
              shortlisted_project_proposal_template_id,
            media_setting_image,
            media_setting_video,
            media_setting_floor_plan,
            media_setting_brocure,
            info_setting_key_stats,
            info_setting_project_highlights,
            info_setting_why_invest,
            info_setting_shopping,
            info_setting_transport,
            info_setting_education,
            hidden_media,
            media_order,
          },
          {
            transaction: this.dbTransaction,
          },
        );
      }

      shortListedProjectSettingProposalTemplate =
        await this.models.shortlisted_project_setting_proposal_template.findOne(
          {
            where: {
              shortlisted_project_proposal_template_fk:
                shortlisted_project_proposal_template_id,
            },
            transaction: this.dbTransaction,
          },
        );

      const updateShortlistedPropertySettingProposalTemplates =
        shortlisted_property_setting_proposal_templates
          .map((shortlisted_property_setting_proposal_template) => ({
            ...shortlisted_property_setting_proposal_template,
            shortListedProjectSettingProposalTemplate,
          }))
          .map((shortlisted_property_setting_proposal_template) =>
            this.upsertShortlistedPropertySettingProposalTemplates(
              shortlisted_property_setting_proposal_template,
            ),
          );

      const shortlistedPropertySettingProposalTemplates = await Promise.all(
        updateShortlistedPropertySettingProposalTemplates,
      );
      return {
        ...shortListedProjectSettingProposalTemplate.dataValues,
        shortlistedPropertySettingProposalTemplates,
      };
    } catch (err) {
      req.log.error({
        funcName,
        error: err,
      });
      throw err;
    }
  }

  // helpers
  async upsertShortlistedPropertySettingProposalTemplates({
    shortListedProjectSettingProposalTemplate,
    shortlisted_property_proposal_template_id,
    media_setting_image,
    media_setting_video,
    media_setting_floor_plan,
    media_setting_brocure,
    hidden_media,
    media_order,
  }) {
    if (
      !shortlisted_property_proposal_template_id ||
      !uuid.validate(shortlisted_property_proposal_template_id)
    )
      return;
    let projectPropertySettingProposalTemplate =
      await this.models.shortlisted_property_setting_proposal_template.findOne({
        where: {
          shortlisted_project_setting_fk:
            shortListedProjectSettingProposalTemplate.shortlisted_project_setting_proposal_template_id,
          shortlisted_property_proposal_template_fk:
            shortlisted_property_proposal_template_id,
        },
      });

    if (projectPropertySettingProposalTemplate) {
      await this.models.shortlisted_property_setting_proposal_template.update(
        {
          media_setting_image,
          media_setting_video,
          media_setting_floor_plan,
          media_setting_brocure,
          hidden_media,
          media_order,
        },
        {
          where: {
            shortlisted_property_setting_proposal_template_id:
              projectPropertySettingProposalTemplate.shortlisted_property_setting_proposal_template_id,
          },
          transaction: this.dbTransaction,
        },
      );
    } else {
      const shortlisted_property_setting_proposal_template_id =
        h.general.generateId();
      await this.models.shortlisted_property_setting.create(
        {
          shortlisted_property_setting_proposal_template_id,
          shortlisted_project_setting_proposal_template_fk:
            shortListedProjectSettingProposalTemplate.shortlisted_project_setting_id,
          shortlisted_property_proposal_template_fk:
            shortlisted_property_proposal_template_id,
          media_setting_image,
          media_setting_video,
          media_setting_floor_plan,
          media_setting_brocure,
          hidden_media,
          media_order,
        },
        { transaction: this.dbTransaction },
      );
    }

    projectPropertySettingProposalTemplate =
      await this.models.shortlisted_property_setting.findOne({
        where: {
          shortlisted_project_setting_proposal_template_fk:
            shortListedProjectSettingProposalTemplate.shortlisted_project_setting_id,
          shortlisted_property_proposal_template_fk:
            shortlisted_property_proposal_template_id,
        },
      });

    return projectPropertySettingProposalTemplate;
  }
}

module.exports = NonStaffShortlistedProjectSettingProposalTemplateService;
