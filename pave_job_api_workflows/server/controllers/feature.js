const h = require('../helpers');

module.exports.makeFeatureController = (models) => {
  const { feature: featureModel } = models;
  const featureController = {};

  /**
   * Create feature record
   * @param {{
   *  name: string,
   *  type: string,
   *  project_fk_unique: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  featureController.create = async (record, { transaction } = {}) => {
    const funcName = 'featureController.create';
    h.validation.requiredParams(funcName, { record });
    const { name, type, project_fk_unique, created_by } = record;

    const feature_id = h.general.generateId();
    await featureModel.create(
      {
        feature_id,
        name,
        type,
        project_fk_unique,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return feature_id;
  };

  /**
   * Update feature record
   * @param {string} feature_id
   * @param {{
   *  name: string,
   *  type: string,
   *  project_fk_unique: string,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  featureController.update = async (
    feature_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'featureController.update';
    h.validation.requiredParams(funcName, { feature_id, record });
    const { name, type, project_fk_unique, updated_by } = record;
    await featureModel.update(
      {
        name,
        type,
        project_fk_unique,
        updated_by,
      },
      { where: { feature_id }, transaction },
    );
    return feature_id;
  };

  /**
   * Find all feature records
   * @param {{
   *  feature_id: string,
   *  name: string,
   *  type: string,
   *  project_fk_unique: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  featureController.findAll = async (
    where,
    { include, transaction, order } = {},
  ) => {
    const funcName = 'featureController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await featureModel.findAll({
      where: { ...where },
      include,
      transaction,
      order,
    });
    return h.database.formatData(records);
  };

  /**
   * Find single feature record
   * @param {{
   *  feature_id: string,
   *  name: string,
   *  type: string,
   *  project_fk_unique: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  featureController.findOne = async (where, { include, transaction } = {}) => {
    const funcName = 'featureController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await featureModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Hard delete feature record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  featureController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'featureController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await featureModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return featureController;
};
