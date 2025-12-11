const h = require('../helpers');

module.exports.makeController = (models) => {
  const {
    shortlisted_property_setting_proposal_template:
      shortlistedPropertySettingProposalTemplateModel,
  } = models;

  const shortlistedPropertySettingProposalTemplateCtl = {};
  /**
   * Create short listed property setting proposal template record
   * @param {{
   *  shortlisted_project_setting_proposal_template_fk: string,
   *  shortlisted_property_proposal_template_fk: string,
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
  shortlistedPropertySettingProposalTemplateCtl.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistedPropertySettingProposalTemplateCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      shortlisted_project_setting_proposal_template_fk,
      shortlisted_property_proposal_template_fk,
      media_setting_image,
      media_setting_video,
      media_setting_floor_plan,
      media_setting_brocure,
      media_setting_factsheet,
      hidden_media,
      media_order,
      created_by,
    } = record;
    const shortlisted_property_setting_proposal_template_id =
      h.general.generateId();
    await shortlistedPropertySettingProposalTemplateModel.create(
      {
        shortlisted_property_setting_proposal_template_id,
        shortlisted_project_setting_proposal_template_fk,
        shortlisted_property_proposal_template_fk,
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
    return shortlisted_property_setting_proposal_template_id;
  };

  /**
   * Update short listed property setting proposal template record
   * @param {string} shortlisted_property_setting_proposal_template_id
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
  shortlistedPropertySettingProposalTemplateCtl.update = async (
    shortlisted_property_setting_proposal_template_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistedPropertySettingProposalTemplateCtl.update';
    h.validation.requiredParams(funcName, {
      shortlisted_property_setting_proposal_template_id,
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
    await shortlistedPropertySettingProposalTemplateModel.update(
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
      {
        where: { shortlisted_property_setting_proposal_template_id },
        transaction,
      },
    );
    return shortlisted_property_setting_proposal_template_id;
  };

  /**
   * Find all short listed property setting proposal template records
   * @param {{
   *  shortlisted_project_setting_proposal_template_fk: string,
   *  shortlisted_property_proposal_template_fk: string,
   *  created_by: string
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  shortlistedPropertySettingProposalTemplateCtl.findAll = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'shortlistedPropertySettingProposalTemplateCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records =
      await shortlistedPropertySettingProposalTemplateModel.findAll({
        where: { ...where },
        include,
        transaction,
      });
    return h.database.formatData(records);
  };

  /**
   * Find one short listed property setting proposal template record
   * @param {{
   *  shortlisted_project_setting_proposal_template_fk: string,
   *  shortlisted_property_proposal_template_fk: string,
   *  created_by: string
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  shortlistedPropertySettingProposalTemplateCtl.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'shortlistedPropertySettingProposalTemplateCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record =
      await shortlistedPropertySettingProposalTemplateModel.findOne({
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
  shortlistedPropertySettingProposalTemplateCtl.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistedPropertySettingProposalTemplateCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record =
      await shortlistedPropertySettingProposalTemplateModel.findOne({
        where: { ...where },
        transaction,
      });
    if (record) await record.destroy({ transaction });
  };

  return shortlistedPropertySettingProposalTemplateCtl;
};
