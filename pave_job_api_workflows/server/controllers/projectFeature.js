const h = require('../helpers');

module.exports.makeProjectFeatureController = (models) => {
  const { project_feature: projectFeatureModel } = models;
  const projectFeatureController = {};

  /**
   * Create project feature record
   * @param {{
   *  project_fk: string,
   *  feature_fk: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  projectFeatureController.create = async (record, { transaction } = {}) => {
    const funcName = 'projectFeatureController.create';
    h.validation.requiredParams(funcName, { record });
    const { project_fk, feature_fk, created_by } = record;

    const project_feature_id = h.general.generateId();
    await projectFeatureModel.create(
      {
        project_feature_id,
        project_fk,
        feature_fk,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return project_feature_id;
  };

  /**
   * Update project feature record
   * @param {string} project_feature_id
   * @param {{
   *  project_fk: string,
   *  name: string,
   *  type: string,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  projectFeatureController.update = async (
    project_feature_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'projectFeatureController.update';
    h.validation.requiredParams(funcName, { project_feature_id, record });
    const { project_fk, name, type, updated_by } = record;
    await projectFeatureModel.update(
      {
        project_fk,
        name,
        type,
        updated_by,
      },
      { where: { project_feature_id }, transaction },
    );
    return project_feature_id;
  };

  /**
   * Find all project feature records
   * @param {{
   *  project_feature_id: string,
   *  project_fk: string,
   *  name: string,
   *  type: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  projectFeatureController.findAll = async (
    where,
    { include, transaction, order } = {},
  ) => {
    const funcName = 'projectFeatureController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await projectFeatureModel.findAll({
      where: { ...where },
      include,
      transaction,
      order,
    });
    return h.database.formatData(records);
  };

  /**
   * Find single project feature record
   * @param {{
   *  project_feature_id: string,
   *  project_fk: string,
   *  name: string,
   *  type: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  projectFeatureController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'projectFeatureController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await projectFeatureModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Hard delete project feature record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  projectFeatureController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'projectFeatureController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await projectFeatureModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return projectFeatureController;
};
