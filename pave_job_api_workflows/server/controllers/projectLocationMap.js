const h = require('../helpers');

module.exports.makeProjectLocationMapController = (models) => {
  const { project_location_map: projectLocationMapModel } = models;
  const projectLocationMapController = {};

  /**
   * Create project location map record
   * @param {{
   *  project_fk: string,
   *  name: string,
   *  slug: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  projectLocationMapController.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'projectLocationMapController.create';
    h.validation.requiredParams(funcName, { record });
    const { project_fk, name, slug, created_by } = record;

    const project_location_map_id = h.general.generateId();
    await projectLocationMapModel.create(
      {
        project_location_map_id,
        project_fk,
        name,
        slug,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return project_location_map_id;
  };

  /**
   * Update project location map record
   * @param {string} project_location_map_id
   * @param {{
   *  project_fk: string,
   *  name: string,
   *  slug: string,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  projectLocationMapController.update = async (
    project_location_map_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'projectLocationMapController.update';
    h.validation.requiredParams(funcName, { project_location_map_id, record });
    const { project_fk, name, slug, updated_by } = record;
    await projectLocationMapModel.update(
      {
        project_fk,
        name,
        slug,
        updated_by,
      },
      { where: { project_location_map_id }, transaction },
    );
    return project_location_map_id;
  };

  /**
   * Find all project location map records
   * @param {{
   *  project_location_map_id: string,
   *  project_fk: string,
   *  name: string,
   *  slug: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  projectLocationMapController.findAll = async (
    where,
    { include, transaction, order } = {},
  ) => {
    const funcName = 'projectLocationMapController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await projectLocationMapModel.findAll({
      where: { ...where },
      include,
      transaction,
      order,
    });
    return h.database.formatData(records);
  };

  /**
   * Find single project location map record
   * @param {{
   *  project_location_map_id: string,
   *  project_fk: string,
   *  name: string,
   *  slug: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  projectLocationMapController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'projectLocationMapController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await projectLocationMapModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Hard delete project location map record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  projectLocationMapController.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'projectLocationMapController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await projectLocationMapModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return projectLocationMapController;
};
