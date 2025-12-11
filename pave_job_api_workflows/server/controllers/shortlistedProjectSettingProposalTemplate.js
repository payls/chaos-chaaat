const h = require('../helpers');

module.exports.makeController = (models) => {
  const {
    shortlisted_project_setting_proposal_temaplate:
      shortlistedProjectSettingProposalTemplateModel,
  } = models;

  const shortlistedProjectSettingProposalTemplateCtl = {};

  /**
   * Create short listed project setting proposal template record
   * @param {{
   *  shortlisted_project_proposal_template_fk: string,
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
  shortlistedProjectSettingProposalTemplateCtl.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistedProjectSettingProposalTemplateCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      shortlisted_project_proposal_template_fk,
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
    const shortlisted_project_setting_proposal_template_id =
      h.general.generateId();
    await shortlistedProjectSettingProposalTemplateModel.create(
      {
        shortlisted_project_setting_proposal_template_id,
        shortlisted_project_proposal_template_fk,
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
    return shortlisted_project_setting_proposal_template_id;
  };

  /**
   * Update short listed project setting proposal template record
   * @param {string} shortlisted_project_setting_proposal_template_id
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
  shortlistedProjectSettingProposalTemplateCtl.update = async (
    shortlisted_project_setting_proposal_template_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistedProjectSettingProposalTemplateCtl.update';
    h.validation.requiredParams(funcName, {
      shortlisted_project_setting_proposal_template_id,
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
    await shortlistedProjectSettingProposalTemplateModel.update(
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
      {
        where: { shortlisted_project_setting_proposal_template_id },
        transaction,
      },
    );
    return shortlisted_project_setting_proposal_template_id;
  };

  /**
   * Find all short listed project setting proposal template records
   * @param {{
   *  shortlisted_project_proposal_template_fk?: string,
   *  created_by: string
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  shortlistedProjectSettingProposalTemplateCtl.findAll = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'shortlistedProjectSettingProposalTemplateCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records =
      await shortlistedProjectSettingProposalTemplateModel.findAll({
        where: { ...where },
        include,
        transaction,
      });
    return h.database.formatData(records);
  };

  /**
   * Find one short listed project setting proposal template record
   * @param {{
   *  shortlisted_project_setting_proposal_template_id?: string,
   *  shortlisted_project_proposal_template_fk?: string,
   *  created_by: string
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  shortlistedProjectSettingProposalTemplateCtl.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'shortlistedProjectSettingProposalTemplateCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await shortlistedProjectSettingProposalTemplateModel.findOne(
      {
        where: { ...where },
        include,
        transaction,
      },
    );
    return h.database.formatData(record);
  };

  /**
   * Hard delete short listed project setting proposal template record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  shortlistedProjectSettingProposalTemplateCtl.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistedProjectSettingProposalTemplateCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await shortlistedProjectSettingProposalTemplateModel.findOne(
      {
        where: { ...where },
        transaction,
      },
    );
    if (record) await record.destroy({ transaction });
  };

  return shortlistedProjectSettingProposalTemplateCtl;
};
