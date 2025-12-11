const h = require('../helpers');

module.exports.makeController = (models) => {
  const { campaign_cta: campaignCtaModel } = models;

  const campaignCtaCtl = {};

  /**
   * Create campaign_cta record
   * @param {{
   *  campaign_tracker_ref_name,
   *  cta_1: string,
   *  cta_1_response: text,
   *  trigger_cta_1_options: string,
   *  cta_2: string,
   *  cta_2_response: text,
   *  trigger_cta_2_options: string,
   *  cta_3: string,
   *  cta_3_response: text,
   *  trigger_cta_3_options: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  campaignCtaCtl.create = async (record, { transaction } = {}) => {
    const funcName = 'campaignCtaCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      campaign_tracker_ref_name,
      message_channel,
      is_workflow,
      message_flow_data,
      cta_1,
      cta_1_response,
      trigger_cta_1_options,
      cta_2,
      cta_2_response,
      trigger_cta_2_options,
      cta_3,
      cta_3_response,
      trigger_cta_3_options,
      cta_4,
      cta_4_response,
      trigger_cta_4_options,
      cta_5,
      cta_5_response,
      trigger_cta_5_options,
      cta_1_option_type,
      cta_2_option_type,
      cta_3_option_type,
      cta_4_option_type,
      cta_5_option_type,
      cta_1_final_response,
      cta_2_final_response,
      cta_3_final_response,
      cta_4_final_response,
      cta_5_final_response,
      cta_6,
      cta_6_response,
      trigger_cta_6_options,
      cta_6_final_response,
      cta_6_option_type,
      cta_7,
      cta_7_response,
      trigger_cta_7_options,
      cta_7_final_response,
      cta_7_option_type,
      cta_8,
      cta_8_response,
      trigger_cta_8_options,
      cta_8_final_response,
      cta_8_option_type,
      cta_9,
      cta_9_response,
      trigger_cta_9_options,
      cta_9_final_response,
      cta_9_option_type,
      cta_10,
      cta_10_response,
      trigger_cta_10_options,
      cta_10_final_response,
      cta_10_option_type,
      campaign_notification_additional_recipients,
      is_confirmation,
      created_by,
    } = record;
    const campaign_cta_id = h.general.generateId();
    await campaignCtaModel.create(
      {
        campaign_cta_id,
        campaign_tracker_ref_name,
        message_channel,
        is_workflow,
        message_flow_data,
        cta_1,
        cta_1_response,
        trigger_cta_1_options,
        cta_2,
        cta_2_response,
        trigger_cta_2_options,
        cta_3,
        cta_3_response,
        trigger_cta_3_options,
        cta_4,
        cta_4_response,
        trigger_cta_4_options,
        cta_5,
        cta_5_response,
        trigger_cta_5_options,
        cta_1_option_type,
        cta_2_option_type,
        cta_3_option_type,
        cta_4_option_type,
        cta_5_option_type,
        cta_1_final_response,
        cta_2_final_response,
        cta_3_final_response,
        cta_4_final_response,
        cta_5_final_response,
        cta_6,
        cta_6_response,
        trigger_cta_6_options,
        cta_6_final_response,
        cta_6_option_type,
        cta_7,
        cta_7_response,
        trigger_cta_7_options,
        cta_7_final_response,
        cta_7_option_type,
        cta_8,
        cta_8_response,
        trigger_cta_8_options,
        cta_8_final_response,
        cta_8_option_type,
        cta_9,
        cta_9_response,
        trigger_cta_9_options,
        cta_9_final_response,
        cta_9_option_type,
        cta_10,
        cta_10_response,
        trigger_cta_10_options,
        cta_10_final_response,
        cta_10_option_type,
        campaign_notification_additional_recipients,
        is_confirmation,
        created_by,
      },
      { transaction },
    );

    return campaign_cta_id;
  };
  /**
   * Update campaign_cta record
   * @param {string} campaign_cta_id
   * @param {{
   *  campaign_cta_id: string,
   *  campaign_tracker_ref_name,
   *  cta_1: string,
   *  cta_2: string,
   *  cta_3: string,
   *	updated_by: string
   * }} record
   * @param {string} updated_by
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  campaignCtaCtl.update = async (
    campaign_cta_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'campaignCtaCtl.update';
    h.validation.requiredParams(funcName, { record });
    const {
      campaign_tracker_ref_name,
      message_channel,
      is_workflow,
      message_flow_data,
      cta_1,
      cta_1_response,
      trigger_cta_1_options,
      cta_2,
      cta_2_response,
      trigger_cta_2_options,
      cta_3,
      cta_3_response,
      trigger_cta_3_options,
      cta_4,
      cta_4_response,
      trigger_cta_4_options,
      cta_5,
      cta_5_response,
      trigger_cta_5_options,
      cta_1_option_type,
      cta_2_option_type,
      cta_3_option_type,
      cta_4_option_type,
      cta_5_option_type,
      cta_1_final_response,
      cta_2_final_response,
      cta_3_final_response,
      cta_4_final_response,
      cta_5_final_response,
      cta_6,
      cta_6_response,
      trigger_cta_6_options,
      cta_6_final_response,
      cta_6_option_type,
      cta_7,
      cta_7_response,
      trigger_cta_7_options,
      cta_7_final_response,
      cta_7_option_type,
      cta_8,
      cta_8_response,
      trigger_cta_8_options,
      cta_8_final_response,
      cta_8_option_type,
      cta_9,
      cta_9_response,
      trigger_cta_9_options,
      cta_9_final_response,
      cta_9_option_type,
      cta_10,
      cta_10_response,
      trigger_cta_10_options,
      cta_10_final_response,
      cta_10_option_type,
      campaign_notification_additional_recipients,
      is_confirmation,
    } = record;

    await campaignCtaModel.update(
      {
        campaign_cta_id,
        campaign_tracker_ref_name,
        message_channel,
        is_workflow,
        message_flow_data,
        cta_1,
        cta_1_response,
        trigger_cta_1_options,
        cta_2,
        cta_2_response,
        trigger_cta_2_options,
        cta_3,
        cta_3_response,
        trigger_cta_3_options,
        cta_4,
        cta_4_response,
        trigger_cta_4_options,
        cta_5,
        cta_5_response,
        trigger_cta_5_options,
        cta_1_option_type,
        cta_2_option_type,
        cta_3_option_type,
        cta_4_option_type,
        cta_5_option_type,
        cta_1_final_response,
        cta_2_final_response,
        cta_3_final_response,
        cta_4_final_response,
        cta_5_final_response,
        cta_6,
        cta_6_response,
        trigger_cta_6_options,
        cta_6_final_response,
        cta_6_option_type,
        cta_7,
        cta_7_response,
        trigger_cta_7_options,
        cta_7_final_response,
        cta_7_option_type,
        cta_8,
        cta_8_response,
        trigger_cta_8_options,
        cta_8_final_response,
        cta_8_option_type,
        cta_9,
        cta_9_response,
        trigger_cta_9_options,
        cta_9_final_response,
        cta_9_option_type,
        cta_10,
        cta_10_response,
        trigger_cta_10_options,
        cta_10_final_response,
        cta_10_option_type,
        campaign_notification_additional_recipients,
        is_confirmation,
        updated_by,
      },
      {
        where: { campaign_cta_id },
        transaction,
      },
    );

    return campaign_cta_id;
  };

  /**
   * Find all campaign_cta records
   * @param {{
   *  campaign_cta_id: string,
   *  campaign_tracker_ref_name,
   *  cta_1: string,
   *  cta_2: string,
   *  cta_3: string,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  campaignCtaCtl.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'campaignCtaCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await campaignCtaModel.findAll({
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
   * Find one campaign_cta record
   * @param {{
   *  campaign_cta_id: string,
   *  campaign_tracker_ref_name,
   *  cta_1: string,
   *  cta_2: string,
   *  cta_3: string,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  campaignCtaCtl.findOne = async (where, { include, transaction } = {}) => {
    const funcName = 'campaignCtaCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await campaignCtaModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete campaign_cta record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  campaignCtaCtl.destroy = async (where, { transaction } = {}) => {
    const funcName = 'campaignCtaCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await campaignCtaModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return campaignCtaCtl;
};
