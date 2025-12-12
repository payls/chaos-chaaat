const uuid = require('uuid');
const h = require('../helpers');
const NonStaffCommon = require('./common');
const Sentry = require('@sentry/node');

class NonStaffShortlistedProjectSettingService extends NonStaffCommon {
  constructor() {
    super();
    this.shortlistedProjectController =
      require('../controllers/shortlistedProject').makeShortListedProjectController(
        this.models,
      );
    this.contactController =
      require('../controllers/contact').makeContactController(this.models);
  }

  /**
   * Get Shorlisted Project Settings
   * @param {FastifyRequest} request
   * @returns {Promise<[]>}
   */
  async getShorlistedProjectSettings(req) {
    const funcName =
      'NonStaffShortlistedProjectSetting.getShorlistedProjectSettings';
    const { shortlisted_project_id } = req.params;

    try {
      h.validation.requiredParams(funcName, {
        shortlisted_project_id,
      });

      const shortListedProjectSetting =
        await this.models.shortlisted_project_setting.findOne({
          where: {
            shortlisted_project_fk: shortlisted_project_id,
          },
          include: [{ model: this.models.shortlisted_property_setting }],
          transaction: this.dbTransaction,
        });

      return shortListedProjectSetting;
    } catch (err) {
      Sentry.captureException(err);
      req.log.error({
        funcName,
        error: err,
      });
      throw err;
    }
  }

  async upsertShorlistedProjectSettings(req) {
    const funcName =
      'NonStaffShortlistedProjectSetting.upsertShorlistedProjectSettings';
    const { shortlisted_project_id } = req.params;
    const {
      media_setting_image,
      media_setting_video,
      media_setting_floor_plan,
      media_setting_brocure,
      media_setting_factsheet,
      media_setting_render_3d,
      info_setting_key_stats,
      info_setting_project_highlights,
      info_setting_why_invest,
      info_setting_shopping,
      info_setting_transport,
      info_setting_education,
      hidden_media,
      media_order,
      shortlisted_property_settings = [],
    } = req.body;
    console.log(req.body);
    try {
      h.validation.requiredParams(funcName, {
        shortlisted_project_id,
      });

      let shortListedProjectSetting =
        await this.models.shortlisted_project_setting.findOne({
          where: {
            shortlisted_project_fk: shortlisted_project_id,
          },
          transaction: this.dbTransaction,
        });

      if (shortListedProjectSetting) {
        await this.models.shortlisted_project_setting.update(
          {
            media_setting_image,
            media_setting_video,
            media_setting_floor_plan,
            media_setting_brocure,
            media_setting_factsheet,
            media_setting_render_3d,
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
              shortlisted_project_fk: shortlisted_project_id,
            },
            transaction: this.dbTransaction,
          },
        );
      } else {
        const shortlisted_project_setting_id = h.general.generateId();
        await this.models.shortlisted_project_setting.create(
          {
            shortlisted_project_setting_id,
            shortlisted_project_fk: shortlisted_project_id,
            media_setting_image,
            media_setting_video,
            media_setting_floor_plan,
            media_setting_brocure,
            media_setting_factsheet,
            media_setting_render_3d,
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

      shortListedProjectSetting =
        await this.models.shortlisted_project_setting.findOne({
          where: {
            shortlisted_project_fk: shortlisted_project_id,
          },
          transaction: this.dbTransaction,
        });

      const updateShortlistedPropertySettings = shortlisted_property_settings
        .map((shortlisted_property_setting) => ({
          ...shortlisted_property_setting,
          shortListedProjectSetting,
        }))
        .map((shortlisted_property_setting) =>
          this.upsertShortlistedPropertySettings(shortlisted_property_setting),
        );

      const shortlistedPropertySettings = await Promise.all(
        updateShortlistedPropertySettings,
      );
      return {
        ...shortListedProjectSetting.dataValues,
        shortlistedPropertySettings,
      };
    } catch (err) {
      Sentry.captureException(err);
      req.log.error({
        funcName,
        error: err,
      });
      throw err;
    }
  }

  // helpers
  async upsertShortlistedPropertySettings({
    shortListedProjectSetting,
    shortlisted_property_id,
    media_setting_image,
    media_setting_video,
    media_setting_floor_plan,
    media_setting_brocure,
    media_setting_factsheet,
    media_setting_render_3d,
    hidden_media,
    media_order,
  }) {
    if (!shortlisted_property_id || !uuid.validate(shortlisted_property_id))
      return;
    let projectPropertySetting =
      await this.models.shortlisted_property_setting.findOne({
        where: {
          shortlisted_project_setting_fk:
            shortListedProjectSetting.shortlisted_project_setting_id,
          shortlisted_property_fk: shortlisted_property_id,
        },
      });

    if (projectPropertySetting) {
      await this.models.shortlisted_property_setting.update(
        {
          media_setting_image,
          media_setting_video,
          media_setting_floor_plan,
          media_setting_brocure,
          media_setting_factsheet,
          media_setting_render_3d,
          hidden_media,
          media_order,
        },
        {
          where: {
            shortlisted_property_setting_id:
              projectPropertySetting.shortlisted_property_setting_id,
          },
          transaction: this.dbTransaction,
        },
      );
    } else {
      const shortlisted_property_setting_id = h.general.generateId();
      await this.models.shortlisted_property_setting.create(
        {
          shortlisted_property_setting_id,
          shortlisted_project_setting_fk:
            shortListedProjectSetting.shortlisted_project_setting_id,
          shortlisted_property_fk: shortlisted_property_id,
          media_setting_image,
          media_setting_video,
          media_setting_floor_plan,
          media_setting_brocure,
          media_setting_factsheet,
          media_setting_render_3d,
          hidden_media,
          media_order,
        },
        { transaction: this.dbTransaction },
      );
    }

    projectPropertySetting =
      await this.models.shortlisted_property_setting.findOne({
        where: {
          shortlisted_project_setting_fk:
            shortListedProjectSetting.shortlisted_project_setting_id,
          shortlisted_property_fk: shortlisted_property_id,
        },
      });

    return projectPropertySetting;
  }
}

module.exports = NonStaffShortlistedProjectSettingService;
