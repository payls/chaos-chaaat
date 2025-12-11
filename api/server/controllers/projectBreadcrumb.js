const h = require('../helpers');

module.exports.makeProjectBreadCrumbController = (models) => {
  const { project_breadcrumb: projectBreadcrumbModel } = models;
  const projectBreadcrumbController = {};

  /**
   * Create project breadcrumb record
   * @param {{
   *  project_fk: string,
   *  text: string,
   *  url: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  projectBreadcrumbController.create = async (record, { transaction } = {}) => {
    const funcName = 'projectBreadcrumbController.create';
    h.validation.requiredParams(funcName, { record });
    const { project_fk, text, url, created_by } = record;

    const project_breadcrumb_id = h.general.generateId();
    await projectBreadcrumbModel.create(
      {
        project_breadcrumb_id,
        project_fk,
        text,
        url,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return project_breadcrumb_id;
  };

  /**
   * Update project breadcrumb record
   * @param {string} project_breadcrumb_id
   * @param {{
   *  project_fk: string,
   *  text: string,
   *  url: string,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  projectBreadcrumbController.update = async (
    project_breadcrumb_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'projectBreadcrumbController.update';
    h.validation.requiredParams(funcName, { project_breadcrumb_id, record });
    const { project_fk, text, url, updated_by } = record;
    await projectBreadcrumbModel.update(
      {
        project_fk,
        text,
        url,
        updated_by,
      },
      { where: { project_breadcrumb_id }, transaction },
    );
    return project_breadcrumb_id;
  };

  /**
   * Find all project breadcrumb records
   * @param {{
   *  project_breadcrumb_id: string,
   *  project_fk: string,
   *  text: string,
   *  url: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  projectBreadcrumbController.findAll = async (
    where,
    { include, transaction, order } = {},
  ) => {
    const funcName = 'projectBreadcrumbController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await projectBreadcrumbModel.findAll({
      where: { ...where },
      include,
      transaction,
      order,
    });
    return h.database.formatData(records);
  };

  /**
   * Find single project breacrumb record
   * @param {{
   *  project_breadcrumb_id: string,
   *  project_fk: string,
   *  text: string,
   *  url: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  projectBreadcrumbController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'projectBreadcrumbController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await projectBreadcrumbModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Hard delete project breadcrumb record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  projectBreadcrumbController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'projectBreadcrumbController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await projectBreadcrumbModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return projectBreadcrumbController;
};
