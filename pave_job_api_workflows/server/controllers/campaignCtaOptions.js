const h = require('../helpers');

module.exports.makeController = (models) => {
  const { campaign_cta_options: campaignCtaOptionsModel } = models;

  const campaignCtaOptionsCtl = {};

  /**
   * Create campaign_cta_options record
   * @param {{
   *  campaign_cta_option_id: {
   *   type: DataTypes.UUID,
   *   defaultValue: uuidv4(),
   *   primaryKey: true,
   * },
   * tracker_ref_name: { type: DataTypes.STRING },
   * response_trigger: { type: DataTypes.STRING },
   * response_body: { type: DataTypes.TEXT },
   * response_options: { type: DataTypes.TEXT },
   * second_response_body: { type: DataTypes.TEXT },
   * second_response_options: { type: DataTypes.TEXT },
   * final_response_body: { type: DataTypes.TEXT },
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  campaignCtaOptionsCtl.create = async (record, { transaction } = {}) => {
    const funcName = 'campaignCtaOptionsCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      tracker_ref_name,
      response_trigger,
      response_body,
      response_options,
      second_response_body,
      second_response_options,
      final_response_body,
      created_by,
    } = record;
    const campaign_cta_option_id = h.general.generateId();
    await campaignCtaOptionsModel.create(
      {
        campaign_cta_option_id,
        tracker_ref_name,
        response_trigger,
        response_body,
        response_options,
        second_response_body,
        second_response_options,
        final_response_body,
        created_by,
      },
      { transaction },
    );

    return campaign_cta_option_id;
  };
  /**
   * Update campaign_cta_options record
   * @param {string} campaign_cta_option_id
   * @param {{
   * campaign_cta_option_id: string,
   * tracker_ref_name: { type: DataTypes.STRING },
   * response_trigger: { type: DataTypes.STRING },
   * response_body: { type: DataTypes.TEXT },
   * response_options: { type: DataTypes.TEXT },
   * second_response_body: { type: DataTypes.TEXT },
   * second_response_options: { type: DataTypes.TEXT },
   * final_response_body: { type: DataTypes.TEXT },
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  campaignCtaOptionsCtl.update = async (
    campaign_cta_option_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'campaignCtaOptionsCtl.update';
    h.validation.requiredParams(funcName, { record });
    const {
      tracker_ref_name,
      response_trigger,
      response_body,
      response_options,
      second_response_body,
      second_response_options,
      final_response_body,
    } = record;

    await campaignCtaOptionsModel.update(
      {
        campaign_cta_option_id,
        tracker_ref_name,
        response_trigger,
        response_body,
        response_options,
        second_response_body,
        second_response_options,
        final_response_body,
        updated_by,
      },
      {
        where: { campaign_cta_option_id },
        transaction,
      },
    );

    return campaign_cta_option_id;
  };

  /**
   * Find all campaign_cta_options records
   * @param {{
   * campaign_cta_option_id: string,
   * tracker_ref_name: { type: DataTypes.STRING },
   * response_trigger: { type: DataTypes.STRING },
   * response_body: { type: DataTypes.TEXT },
   * response_options: { type: DataTypes.TEXT },
   * second_response_body: { type: DataTypes.TEXT },
   * second_response_options: { type: DataTypes.TEXT },
   * final_response_body: { type: DataTypes.TEXT },
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  campaignCtaOptionsCtl.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'campaignCtaOptionsCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await campaignCtaOptionsModel.findAll({
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
   * Find one campaign_cta_options record
   * @param {{
   * campaign_cta_option_id: string,
   * tracker_ref_name: { type: DataTypes.STRING },
   * response_trigger: { type: DataTypes.STRING },
   * response_body: { type: DataTypes.TEXT },
   * response_options: { type: DataTypes.TEXT },
   * second_response_body: { type: DataTypes.TEXT },
   * second_response_options: { type: DataTypes.TEXT },
   * final_response_body: { type: DataTypes.TEXT },
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  campaignCtaOptionsCtl.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'campaignCtaOptionsCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await campaignCtaOptionsModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete campaign_cta_options record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  campaignCtaOptionsCtl.destroy = async (where, { transaction } = {}) => {
    const funcName = 'campaignCtaOptionsCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await campaignCtaOptionsModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return campaignCtaOptionsCtl;
};
