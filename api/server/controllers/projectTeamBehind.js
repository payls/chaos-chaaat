const h = require('../helpers');

module.exports.makeProjectTeamBehindController = (models) => {
  const { project_team_behind: projectTeamBehindModel } = models;
  const projectTeamBehindController = {};

  /**
   * Create project team behind record
   * @param {{
   *  project_fk: string,
   *  type: string,
   *  name: string,
   *  logo_url: string,
   *  description: string,
   *  title: string,
   *  filename: string
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  projectTeamBehindController.create = async (record, { transaction } = {}) => {
    const funcName = 'projectTeamBehindController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      project_fk,
      type,
      name,
      logo_url,
      description,
      title,
      filename,
      created_by,
    } = record;

    const project_team_behind_id = h.general.generateId();
    await projectTeamBehindModel.create(
      {
        project_team_behind_id,
        project_fk,
        type,
        name,
        logo_url,
        description,
        title,
        filename,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return project_team_behind_id;
  };

  /**
   * Update project team behind record
   * @param {string} project_breadcrumb_id
   * @param {{
   *  project_fk: string,
   *  type: string,
   *  name: string,
   *  logo_url: string,
   *  description: string,
   *  title: string,
   *  filename: string,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  projectTeamBehindController.update = async (
    project_team_behind_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'projectTeamBehindController.update';
    h.validation.requiredParams(funcName, { project_team_behind_id, record });
    const {
      project_fk,
      type,
      name,
      logo_url,
      description,
      title,
      filename,
      updated_by,
    } = record;
    await projectTeamBehindModel.update(
      {
        project_fk,
        type,
        name,
        logo_url,
        description,
        title,
        filename,
        updated_by,
      },
      { where: { project_team_behind_id }, transaction },
    );
    return project_team_behind_id;
  };

  /**
   * Find all project team behind records
   * @param {{
   *  project_team_behind_id: string,
   *  project_fk: string,
   *  type: string,
   *  name: string,
   *  logo_url: string,
   *  description: string,
   *  title: string,
   *  filename: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  projectTeamBehindController.findAll = async (
    where,
    { include, transaction, order } = {},
  ) => {
    const funcName = 'projectTeamBehindController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await projectTeamBehindModel.findAll({
      where: { ...where },
      include,
      transaction,
      order,
    });
    return h.database.formatData(records);
  };

  /**
   * Find single project team behind record
   * @param {{
   *  project_team_behind_id: string,
   *  project_fk: string,
   *  type: string,
   *  name: string,
   *  logo_url: string,
   *  description: string,
   *  title: string,
   *  filename: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  projectTeamBehindController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'projectTeamBehindController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await projectTeamBehindModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Hard delete project team behind record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  projectTeamBehindController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'projectTeamBehindController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await projectTeamBehindModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return projectTeamBehindController;
};
