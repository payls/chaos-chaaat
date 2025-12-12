const h = require('../helpers');

module.exports.makeContactLeadScoreController = (models) => {
  const { contact_lead_score: contactLeadScoreModel } = models;

  const contactLeadScoreController = {};

  /**
   * Create contact_lead_score record
   * @param {{
   *  contact_fk?: string,
   *  score?: number,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactLeadScoreController.create = async (record, { transaction } = {}) => {
    const funcName = 'contactLeadScoreController.create';
    h.validation.requiredParams(funcName, { record });
    const { contact_fk, score, created_by } = record;
    const contact_lead_score_id = h.general.generateId();
    await contactLeadScoreModel.create(
      {
        contact_lead_score_id,
        contact_fk,
        score,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return contact_lead_score_id;
  };

  /**
   * Update contact_lead_score record
   * @param {string} contact_lead_score_id
   * @param {{
   * 	contact_fk?: string,
   *  score?: number,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactLeadScoreController.update = async (
    contact_lead_score_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'contactLeadScoreController.update';
    h.validation.requiredParams(funcName, { contact_lead_score_id, record });
    const { contact_fk, score, updated_by } = record;
    await contactLeadScoreModel.update(
      {
        contact_fk,
        score,
        updated_by,
      },
      { where: { contact_lead_score_id }, transaction },
    );
    return contact_lead_score_id;
  };

  /**
   * Find all contact_lead_score records
   * @param {{
   *  contact_lead_score_id?: string,
   * 	contact_fk?: string,
   *  score?: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  contactLeadScoreController.findAll = async (
    where,
    {
      order,
      include,
      transaction,
      offset,
      limit,
      subQuery,
      attributes,
      group,
    } = {},
  ) => {
    const funcName = 'contactLeadScoreController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await contactLeadScoreModel.findAll({
      where: { ...where },
      offset,
      limit,
      subQuery,
      include,
      transaction,
      order,
      attributes,
      group,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one contact_lead_score record
   * @param {{
   *  contact_lead_score_id?: string,
   * 	contact_fk?: string,
   *  score?: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  contactLeadScoreController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'contactLeadScoreController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await contactLeadScoreModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete contact_lead_score record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  contactLeadScoreController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'contactLeadScoreController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await contactLeadScoreModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Hard delete contact_lead_score records
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  contactLeadScoreController.destroyAll = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'contactLeadScoreController.destroyAll';
    h.validation.requiredParams(funcName, { where });
    const records = await contactLeadScoreModel.findAll({
      where: { ...where },
      transaction,
    });

    for (const record of records) {
      if (record) await record.destroy({ transaction });
    }
  };

  return contactLeadScoreController;
};
