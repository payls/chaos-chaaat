const h = require('../helpers');

module.exports.makeController = (models) => {
  const { campaign_additional_cta: campaignAdditionalCtaModel } = models;

  const campaignAdditionalCta = {};

  /**
   * Create campaign_additional_cta record
   * @param {{
   *  campaign_additional_cta_id: {
   *   type: DataTypes.UUID,
   *   defaultValue: uuidv4(),
   *   primaryKey: true,
   * },
   * agency_fk: { type: DataTypes.STRING },
   * cta_name: { type: DataTypes.STRING },
   * cta_1: { type: DataTypes.TEXT },
   * cta_2: { type: DataTypes.TEXT },
   * final_response_body: { type: DataTypes.TEXT },
   * final_response_body_2: { type: DataTypes.TEXT },
   * final_response_body_3: { type: DataTypes.TEXT },
   * closing_response_body: { type: DataTypes.TEXT },
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  campaignAdditionalCta.create = async (record, { transaction } = {}) => {
    const funcName = 'campaignAdditionalCta.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      agency_whatsapp_config_fk,
      cta_name,
      cta_1,
      cta_2,
      final_response_body,
      final_response_body_2,
      final_response_body_3,
      closing_response_body,
      created_by,
    } = record;
    const campaign_additional_cta_id = h.general.generateId();
    await campaignAdditionalCtaModel.create(
      {
        campaign_additional_cta_id,
        agency_fk,
        agency_whatsapp_config_fk,
        cta_name,
        cta_1,
        cta_2,
        final_response_body,
        final_response_body_2,
        final_response_body_3,
        closing_response_body,
        created_by,
      },
      { transaction },
    );

    return campaign_additional_cta_id;
  };
  /**
   * Update campaign_additional_cta record
   * @param {string} campaign_additional_cta_id
   * @param {{
   *  campaign_additional_cta_id: {
   *   type: DataTypes.UUID,
   *   defaultValue: uuidv4(),
   *   primaryKey: true,
   * },
   * agency_fk: { type: DataTypes.STRING },
   * cta_name: { type: DataTypes.STRING },
   * cta_1: { type: DataTypes.TEXT },
   * cta_2: { type: DataTypes.TEXT },
   * final_response_body: { type: DataTypes.TEXT },
   * final_response_body_2: { type: DataTypes.TEXT },
   * final_response_body_3: { type: DataTypes.TEXT },
   * closing_response_body: { type: DataTypes.TEXT },
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  campaignAdditionalCta.update = async (
    campaign_additional_cta_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'campaignAdditionalCta.update';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      agency_whatsapp_config_fk,
      cta_name,
      cta_1,
      cta_2,
      final_response_body,
      final_response_body_2,
      final_response_body_3,
      closing_response_body,
    } = record;

    await campaignAdditionalCtaModel.update(
      {
        campaign_additional_cta_id,
        agency_fk,
        agency_whatsapp_config_fk,
        cta_name,
        cta_1,
        cta_2,
        final_response_body,
        final_response_body_2,
        final_response_body_3,
        closing_response_body,
        updated_by,
      },
      {
        where: { campaign_additional_cta_id },
        transaction,
      },
    );

    return campaign_additional_cta_id;
  };

  /**
   * Find all campaign_additional_cta records
   * @param {{
   *  campaign_additional_cta_id: {
   *   type: DataTypes.UUID,
   *   defaultValue: uuidv4(),
   *   primaryKey: true,
   * },
   * agency_fk: { type: DataTypes.STRING },
   * cta_name: { type: DataTypes.STRING },
   * cta_1: { type: DataTypes.TEXT },
   * cta_2: { type: DataTypes.TEXT },
   * final_response_body: { type: DataTypes.TEXT },
   * final_response_body_2: { type: DataTypes.TEXT },
   * final_response_body_3: { type: DataTypes.TEXT },
   * closing_response_body: { type: DataTypes.TEXT },
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  campaignAdditionalCta.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'campaignAdditionalCta.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await campaignAdditionalCtaModel.findAll({
      where: { ...where },
      offset,
      limit,
      subQuery,
      include,
      transaction,
      order,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one campaign_additional_cta records
   * @param {{
   *  campaign_additional_cta_id: {
   *   type: DataTypes.UUID,
   *   defaultValue: uuidv4(),
   *   primaryKey: true,
   * },
   * agency_fk: { type: DataTypes.STRING },
   * cta_name: { type: DataTypes.STRING },
   * cta_1: { type: DataTypes.TEXT },
   * cta_2: { type: DataTypes.TEXT },
   * final_response_body: { type: DataTypes.TEXT },
   * final_response_body_2: { type: DataTypes.TEXT },
   * final_response_body_3: { type: DataTypes.TEXT },
   * closing_response_body: { type: DataTypes.TEXT },
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  campaignAdditionalCta.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'campaignAdditionalCta.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await campaignAdditionalCtaModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete campaign_additional_cta record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  campaignAdditionalCta.destroy = async (where, { transaction } = {}) => {
    const funcName = 'campaignAdditionalCta.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await campaignAdditionalCtaModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return campaignAdditionalCta;
};
