const h = require('../helpers');

module.exports.makeController = (models) => {
  const { automation_rule_template: model } = models;
  const ctr = {};

  ctr.create = async (record, { transaction } = {}) => {
    const funcName = 'ctr.create';
    h.validation.requiredParams(funcName, { record });
    const {
      automation_rule_fk,
      message_channel,
      business_account,
      is_workflow,
      message_flow_data,
      template_fk,
      cta_1_response,
      trigger_cta_1_options,
      cta_2_response,
      trigger_cta_2_options,
      cta_3_response,
      trigger_cta_3_options,
      cta_1_option_type,
      cta_2_option_type,
      cta_3_option_type,
      cta_4_response,
      trigger_cta_4_options,
      cta_4_option_type,
      cta_5_response,
      trigger_cta_5_options,
      cta_5_option_type,
      cta_1_final_response,
      cta_2_final_response,
      cta_3_final_response,
      cta_4_final_response,
      cta_5_final_response,
      cta_1,
      cta_2,
      cta_3,
      cta_4,
      cta_5,
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
    } = record;
    const automation_rule_template_id = h.general.generateId();
    await model.create(
      {
        automation_rule_template_id,
        automation_rule_fk,
        message_channel,
        business_account,
        is_workflow,
        message_flow_data,
        template_fk,
        cta_1_response,
        trigger_cta_1_options,
        cta_2_response,
        trigger_cta_2_options,
        cta_3_response,
        trigger_cta_3_options,
        cta_1_option_type,
        cta_2_option_type,
        cta_3_option_type,
        cta_4_response,
        trigger_cta_4_options,
        cta_4_option_type,
        cta_5_response,
        trigger_cta_5_options,
        cta_5_option_type,
        cta_1_final_response,
        cta_2_final_response,
        cta_3_final_response,
        cta_4_final_response,
        cta_5_final_response,
        cta_1,
        cta_2,
        cta_3,
        cta_4,
        cta_5,
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
      },
      { transaction },
    );
    return automation_rule_template_id;
  };

  ctr.update = async (
    automation_rule_template_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'ctr.update';
    h.validation.requiredParams(funcName, {
      automation_rule_template_id,
      record,
    });
    const {
      automation_rule_fk,
      message_channel,
      business_account,
      is_workflow,
      message_flow_data,
      template_fk,
      cta_1_response,
      trigger_cta_1_options,
      cta_2_response,
      trigger_cta_2_options,
      cta_3_response,
      trigger_cta_3_options,
      cta_1_option_type,
      cta_2_option_type,
      cta_3_option_type,
      cta_4_response,
      trigger_cta_4_options,
      cta_4_option_type,
      cta_5_response,
      trigger_cta_5_options,
      cta_5_option_type,
      cta_1_final_response,
      cta_2_final_response,
      cta_3_final_response,
      cta_4_final_response,
      cta_5_final_response,
      cta_1,
      cta_2,
      cta_3,
      cta_4,
      cta_5,
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
    } = record;
    await model.update(
      {
        automation_rule_fk,
        message_channel,
        business_account,
        is_workflow,
        message_flow_data,
        template_fk,
        cta_1_response,
        trigger_cta_1_options,
        cta_2_response,
        trigger_cta_2_options,
        cta_3_response,
        trigger_cta_3_options,
        cta_1_option_type,
        cta_2_option_type,
        cta_3_option_type,
        cta_4_response,
        trigger_cta_4_options,
        cta_4_option_type,
        cta_5_response,
        trigger_cta_5_options,
        cta_5_option_type,
        cta_1_final_response,
        cta_2_final_response,
        cta_3_final_response,
        cta_4_final_response,
        cta_5_final_response,
        cta_1,
        cta_2,
        cta_3,
        cta_4,
        cta_5,
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
      },
      { where: { automation_rule_template_id }, transaction },
    );
    return automation_rule_template_id;
  };

  ctr.findAll = async (where, { order, include, transaction } = {}) => {
    const funcName = 'ctr.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await model.findAll({
      where: { ...where },
      transaction,
      include,
      order,
    });
    return h.database.formatData(records);
  };

  ctr.findOne = async (where, { transaction, include } = {}) => {
    const funcName = 'ctr.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await model.findOne({
      where: { ...where },
      transaction,
      include,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  ctr.destroy = async (where, { transaction } = {}) => {
    const funcName = 'ctr.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await model.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Hard delete All
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  ctr.destroyAll = async (where, { transaction } = {}) => {
    const funcName = 'ctr.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await model.findAll({
      where: { ...where },
      transaction,
    });
    if (record) await model.destroy({ where: { ...where } }, { transaction });
  };

  return ctr;
};
