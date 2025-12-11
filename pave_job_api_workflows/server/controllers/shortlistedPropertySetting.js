const h = require('../helpers');

module.exports.makeShortlistedPropertySettingController = (models) => {
  const { shortlisted_property_setting: shortlistedPropertySettingModel } =
    models;

  const shortlistedPropertySettingCtl = {};
  /**
   * Create short listed property setting record
   * @param {{
   *  shortlisted_project_setting_fk: string,
   *  shortlisted_property_fk: string,
   *  media_setting_image: boolean,
   *  media_setting_video: boolean,
   *  media_setting_floor_plan: boolean,
   *  media_setting_brocure: boolean,
   *  media_setting_factsheet: boolean,
   *  hidden_media: string,
   *  media_order: string,
   *  created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortlistedPropertySettingCtl.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistedProjectSettingCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      shortlisted_project_setting_fk,
      shortlisted_property_fk,
      media_setting_image,
      media_setting_video,
      media_setting_floor_plan,
      media_setting_brocure,
      media_setting_factsheet,
      hidden_media,
      media_order,
      created_by,
    } = record;
    const shortlisted_property_setting_id = h.general.generateId();
    await shortlistedPropertySettingModel.create(
      {
        shortlisted_property_setting_id,
        shortlisted_project_setting_fk,
        shortlisted_property_fk,
        media_setting_image,
        media_setting_video,
        media_setting_floor_plan,
        media_setting_brocure,
        media_setting_factsheet,
        hidden_media,
        media_order,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return shortlisted_property_setting_id;
  };
  /**
   * Update short listed property setting record
   * @param {string} shortlisted_property_setting_id
   * @param {{
   *  media_setting_image?: boolean,
   *  media_setting_video?: boolean,
   *  media_setting_floor_plan?: boolean,
   *  media_setting_brocure?: boolean,
   *  media_setting_factsheet?: boolean,
   *  hidden_media?: string,
   *  media_order?: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortlistedPropertySettingCtl.update = async (
    shortlisted_property_setting_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistedPropertySettingCtl.update';
    h.validation.requiredParams(funcName, {
      shortlisted_property_setting_id,
      record,
    });
    const {
      media_setting_image,
      media_setting_video,
      media_setting_floor_plan,
      media_setting_brocure,
      media_setting_factsheet,
      hidden_media,
      media_order,
      updated_by,
    } = record;
    await shortlistedPropertySettingModel.update(
      {
        media_setting_image,
        media_setting_video,
        media_setting_floor_plan,
        media_setting_brocure,
        media_setting_factsheet,
        hidden_media,
        media_order,
        updated_by,
      },
      { where: { shortlisted_property_setting_id }, transaction },
    );
    return shortlisted_property_setting_id;
  };

  /**
   * Find all short listed property setting records
   * @param {{
   *  shortlisted_project_setting_fk: string,
   *  shortlisted_property_fk: string,
   *  created_by: string
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  shortlistedPropertySettingCtl.findAll = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'shortlistedPropertySettingCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await shortlistedPropertySettingModel.findAll({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one short listed property setting record
   * @param {{
   *  shortlisted_project_setting_fk: string,
   *  shortlisted_property_fk: string,
   *  created_by: string
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  shortlistedPropertySettingCtl.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'shortlistedPropertySettingCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await shortlistedPropertySettingModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete short listed property setting record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  shortlistedPropertySettingCtl.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistedPropertySettingCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await shortlistedPropertySettingModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return shortlistedPropertySettingCtl;
};
