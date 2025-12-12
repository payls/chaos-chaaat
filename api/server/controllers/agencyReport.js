const h = require('../helpers');

module.exports.makeAgencyReportController = (models) => {
  const { agency_report: agencyReportModel } = models;

  const agencyReportController = {};

  /**
   * Create agency report
   * @param {{
   * 	agency_fk: string,
   *    agency_user_fk: string,
   *    url: string,
   *    filename: string,
   *    from: Date,
   *    to: Date,
   *    created_by: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  agencyReportController.create = async (record, { transaction } = {}) => {
    const funcName = 'agencyReportController.create';
    h.validation.requiredParams(funcName, { record });
    const { agency_fk, agency_user_fk, url, filename, from, to, created_by } =
      record;
    const agency_report_id = h.general.generateId();
    await agencyReportModel.create(
      {
        agency_report_id,
        agency_fk,
        agency_user_fk,
        url,
        filename,
        from,
        to,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return agency_report_id;
  };

  /**
   * Update agency report
   * @param {string} agency_report_id
   * @param {{
   * 	agency_fk: string,
   *    agency_user_fk: string,
   *    url: string,
   *    filename: string,
   *    from: Date,
   *    to: Date,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  agencyReportController.update = async (
    agency_report_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'agencyReportController.update';
    h.validation.requiredParams(funcName, { agency_report_id, record });
    const { agency_fk, agency_user_fk, url, filename, from, to, updated_by } =
      record;
    await agencyReportModel.update(
      {
        agency_fk,
        agency_user_fk,
        url,
        filename,
        from,
        to,
        updated_by,
      },
      { where: { agency_report_id }, transaction },
    );
    return agency_report_id;
  };

  /**
   * Bulk Update agency report
   * @param {{
   *    agency_report_id?: string,
   *    agency_fk?: string,
   *    agency_user_fk?: string,
   *    url?: string,
   *    filename?: string,
   *    from?: Date,
   *    to?: Date,
   * }} where
   * @param {{
   * 	agency_fk: string,
   *    agency_user_fk: string,
   *    url: string,
   *    filename: string,
   *    from: Date,
   *    to: Date,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  agencyReportController.bulkUpdate = async (
    where,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'agencyReportController.bulkUpdate';
    h.validation.requiredParams(funcName, { where, record });
    const { agency_fk, agency_user_fk, url, filename, from, to, updated_by } =
      record;
    return await agencyReportModel.update(
      {
        agency_fk,
        agency_user_fk,
        url,
        filename,
        from,
        to,
        updated_by,
      },
      { where: { ...where }, transaction },
    );
  };

  /**
   * Find all agency reports
   * @param {{
   *    agency_report_id?: string,
   *    agency_fk?: string,
   *    agency_user_fk?: string,
   *    url?: string,
   *    filename?: string,
   *    from?: Date,
   *    to?: Date,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  agencyReportController.findAll = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'agencyReportController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await agencyReportModel.findAll({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one agency report
   * @param {{
   *    agency_report_id?: string,
   *    agency_fk?: string,
   *    agency_user_fk?: string,
   *    url?: string,
   *    filename?: string,
   *    from?: Date,
   *    to?: Date,
   * }} where
   * @param {{ include?:array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  agencyReportController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'agencyReportController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await agencyReportModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete agency report
   * @param {{
   *    agency_report_id?: string,
   *    agency_fk?: string,
   *    agency_user_fk?: string,
   *    url?: string,
   *    filename?: string,
   *    from?: Date,
   *    to?: Date,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  agencyReportController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'agencyReportController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await agencyReportModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return agencyReportController;
};
