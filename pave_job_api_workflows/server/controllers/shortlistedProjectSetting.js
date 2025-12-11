const h = require('../helpers');

module.exports.makeShortlistedProjectSettingController = (models) => {
  const { shortlisted_project_setting: shortlistedProjectSettingModel } =
    models;

  const shortlistedProjectSettingCtl = {};

  /**
   * Create short listed project setting record
   * @param {{
   *  shortlisted_project_fk: string,
   *  media_setting_image: boolean,
   *  media_setting_video: boolean,
   *  media_setting_floor_plan: boolean,
   *  media_setting_brocure: boolean,
   *  media_setting_factsheet: boolean,
   *  info_setting_key_stats: boolean,
   *  info_setting_project_highlights: boolean,
   *  info_setting_why_invest: boolean,
   *  info_setting_shopping: boolean,
   *  info_setting_transport: boolean,
   *  info_setting_education: boolean,
   *  hidden_media: string,
   *  media_order: string,
   *  created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortlistedProjectSettingCtl.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistedProjectSettingCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      shortlisted_project_fk,
      media_setting_image,
      media_setting_video,
      media_setting_floor_plan,
      media_setting_brocure,
      media_setting_factsheet,
      info_setting_key_stats,
      info_setting_project_highlights,
      info_setting_why_invest,
      info_setting_shopping,
      info_setting_transport,
      info_setting_education,
      hidden_media,
      media_order,
      created_by,
    } = record;
    const shortlisted_project_setting_id = h.general.generateId();
    await shortlistedProjectSettingModel.create(
      {
        shortlisted_project_setting_id,
        shortlisted_project_fk,
        media_setting_image,
        media_setting_video,
        media_setting_floor_plan,
        media_setting_brocure,
        media_setting_factsheet,
        info_setting_key_stats,
        info_setting_project_highlights,
        info_setting_why_invest,
        info_setting_shopping,
        info_setting_transport,
        info_setting_education,
        hidden_media,
        media_order,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return shortlisted_project_setting_id;
  };

  /**
   * Update short listed project setting record
   * @param {string} shortlisted_project_setting_id
   * @param {{
   *  media_setting_image?: boolean,
   *  media_setting_video?: boolean,
   *  media_setting_floor_plan?: boolean,
   *  media_setting_brocure?: boolean,
   *  media_setting_factsheet?: boolean,
   *  info_setting_key_stats?: boolean,
   *  info_setting_project_highlights?: boolean,
   *  info_setting_why_invest?: boolean,
   *  info_setting_shopping?: boolean,
   *  info_setting_transport?: boolean,
   *  info_setting_education?: boolean,
   *  hidden_media?: string,
   *  media_order?: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortlistedProjectSettingCtl.update = async (
    shortlisted_project_setting_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistedProjectSettingCtl.update';
    h.validation.requiredParams(funcName, {
      shortlisted_project_setting_id,
      record,
    });
    const {
      media_setting_image,
      media_setting_video,
      media_setting_floor_plan,
      media_setting_brocure,
      media_setting_factsheet,
      info_setting_key_stats,
      info_setting_project_highlights,
      info_setting_why_invest,
      info_setting_shopping,
      info_setting_transport,
      info_setting_education,
      hidden_media,
      media_order,
      updated_by,
    } = record;
    await shortlistedProjectSettingModel.update(
      {
        media_setting_image,
        media_setting_video,
        media_setting_floor_plan,
        media_setting_brocure,
        media_setting_factsheet,
        info_setting_key_stats,
        info_setting_project_highlights,
        info_setting_why_invest,
        info_setting_shopping,
        info_setting_transport,
        info_setting_education,
        hidden_media,
        media_order,
        updated_by,
      },
      { where: { shortlisted_project_setting_id }, transaction },
    );
    return shortlisted_project_setting_id;
  };

  /**
   * Find all short listed project setting records
   * @param {{
   *  shortlisted_project_fk?: string,
   *  created_by: string
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  shortlistedProjectSettingCtl.findAll = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'shortlistedProjectSettingCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await shortlistedProjectSettingModel.findAll({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one short listed project setting record
   * @param {{
   *  shortlisted_project_setting_id?: string,
   *  shortlisted_project_fk?: string,
   *  created_by: string
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  shortlistedProjectSettingCtl.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'shortlistedProjectSettingCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await shortlistedProjectSettingModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete short listed project setting record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  shortlistedProjectSettingCtl.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistedProjectSettingCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await shortlistedProjectSettingModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return shortlistedProjectSettingCtl;
};
