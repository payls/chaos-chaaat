const h = require('../helpers');

module.exports.makeProjectLocationNearbyController = (models) => {
  const { project_location_nearby: projectLocationNearbyModel } = models;
  const projectLocationNearbyController = {};

  /**
   * Create project location nearby record
   * @param {{
   *  project_fk: string,
   *  type: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  projectLocationNearbyController.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'projectLocationNearbyController.create';
    h.validation.requiredParams(funcName, { record });
    const { project_fk, type, created_by } = record;

    const project_location_nearby_id = h.general.generateId();
    await projectLocationNearbyModel.create(
      {
        project_location_nearby_id,
        project_fk,
        type,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return project_location_nearby_id;
  };

  /**
   * Update project location nearby record
   * @param {string} project_location_nearby_id
   * @param {{
   *  project_fk: string,
   *  type: string,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  projectLocationNearbyController.update = async (
    project_location_nearby_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'projectLocationNearbyController.update';
    h.validation.requiredParams(funcName, {
      project_location_nearby_id,
      record,
    });
    const { project_fk, type, updated_by } = record;
    await projectLocationNearbyModel.update(
      {
        project_fk,
        type,
        updated_by,
      },
      { where: { project_location_nearby_id }, transaction },
    );
    return project_location_nearby_id;
  };

  /**
   * Find all project location nearby records
   * @param {{
   *  project_location_nearby_id: string,
   *  project_fk: string,
   *  type: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  projectLocationNearbyController.findAll = async (
    where,
    { include, transaction, order } = {},
  ) => {
    const funcName = 'projectLocationNearbyController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await projectLocationNearbyModel.findAll({
      where: { ...where },
      include,
      transaction,
      order,
    });
    return h.database.formatData(records);
  };

  /**
   * Find single project location nearby record
   * @param {{
   *  project_location_nearby_id: string,
   *  project_fk: string,
   *  type: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  projectLocationNearbyController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'projectLocationNearbyController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await projectLocationNearbyModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Hard delete project location nearby record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  projectLocationNearbyController.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'projectLocationNearbyController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await projectLocationNearbyModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return projectLocationNearbyController;
};
