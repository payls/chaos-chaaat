const h = require('../helpers');

module.exports.makeController = (models) => {
  const { appsync_credentials: appSyncCredentialsModel } = models;

  const appSyncCredentials = {};

  /**
   * Create appsync_credentials record
   * @param {{
   * api_key: string,
   * expiration_date: date,
   * status: string,
   * created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  appSyncCredentials.create = async (record, { transaction } = {}) => {
    const funcName = 'appSyncCredentials.create';
    h.validation.requiredParams(funcName, { record });
    const { api_key, expiration_date, status, created_by } = record;
    const appsync_credentials_id = h.general.generateId();
    await appSyncCredentialsModel.create(
      {
        appsync_credentials_id,
        api_key,
        expiration_date,
        status,
        created_by,
      },
      { transaction },
    );

    return appsync_credentials_id;
  };
  /**
   * Update appsync_credentials record
   * @param {string} appsync_credentials_id
   * @param {{
   * appsync_credentials_id: string,
   * api_key: string,
   * expiration_date: date,
   * status: string,
   * created_by: string
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  appSyncCredentials.update = async (
    appsync_credentials_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'appSyncCredentials.update';
    h.validation.requiredParams(funcName, { record });
    const { api_key, expiration_date, status } = record;

    await appSyncCredentialsModel.update(
      {
        api_key,
        expiration_date,
        status,
        updated_by,
      },
      {
        where: { appsync_credentials_id },
        transaction,
      },
    );

    return appsync_credentials_id;
  };

  /**
   * Find all appsync_credentials records
   * @param {{
   * appsync_credentials_id: string,
   * api_key: string,
   * expiration_date: date,
   * status: string,
   * updated_by: string,
   * created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  appSyncCredentials.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'appSyncCredentials.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await appSyncCredentialsModel.findAll({
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
   * Find one appsync_credentials records
   * @param {{
   * appsync_credentials_id: string,
   * api_key: string,
   * expiration_date: date,
   * status: string,
   * updated_by: string,
   * created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  appSyncCredentials.findOne = async (where, { include, transaction } = {}) => {
    const funcName = 'appSyncCredentials.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await appSyncCredentialsModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete appsync_credentials record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  appSyncCredentials.destroy = async (where, { transaction } = {}) => {
    const funcName = 'appSyncCredentials.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await appSyncCredentialsModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Count appsync_credentials record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  appSyncCredentials.count = async (where, { include, transaction } = {}) => {
    const funcName = 'appSyncCredentials.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await appSyncCredentialsModel.count({
      where: { ...where },
      distinct: true,
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  return appSyncCredentials;
};
