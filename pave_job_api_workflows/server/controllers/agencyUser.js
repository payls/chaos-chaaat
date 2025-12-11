const h = require('../helpers');
const Axios = require('axios');
const config = require('../configs/config')(process.env.NODE_ENV);

module.exports.makeAgencyUserController = (models) => {
  const { agency_user: agencyUserModel } = models;
  const agencyUserController = {};

  /**
   * Create agency user record
   * @param {{
   * 	agency_fk: string,
   * 	user_fk: string,
   *  title?: string
   * 	description?: string,
   *  year_started?: number,
   *  website?: string,
   *  instagram?: string,
   *  linkedin?: string,
   *  facebook?: string,
   *  youtube?: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  agencyUserController.create = async (record, { transaction } = {}) => {
    const funcName = 'agencyUserController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      user_fk,
      title,
      description,
      year_started,
      website,
      instagram,
      linkedin,
      facebook,
      youtube,
      created_by,
    } = record;
    const agency_user_id = h.general.generateId();
    await agencyUserModel.create(
      {
        agency_user_id,
        agency_fk,
        user_fk,
        title,
        description,
        year_started,
        website,
        instagram,
        linkedin,
        facebook,
        youtube,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return agency_user_id;
  };

  /**
   * Update agency user record
   * @param {string} agency_user_id
   * @param {{
   * 	agency_fk: string,
   * 	user_fk: string
   *  title?: string
   * 	description?: string,
   * 	year_started?: number,
   * 	website?: string,
   * 	instagram?: string,
   * 	linkedin?: string,
   *  facebook?: string,
   *  youtube?: string,
   *	updated_by?: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  agencyUserController.update = async (
    agency_user_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'agencyUserController.update';
    h.validation.requiredParams(funcName, { agency_user_id, record });
    const {
      agency_fk,
      user_fk,
      title,
      description,
      year_started,
      website,
      instagram,
      linkedin,
      facebook,
      youtube,
      updated_by,
    } = record;
    await agencyUserModel.update(
      {
        agency_fk,
        user_fk,
        title,
        description,
        year_started,
        website,
        instagram,
        linkedin,
        facebook,
        youtube,
        updated_by,
      },
      { where: { agency_user_id }, transaction },
    );
    return agency_user_id;
  };

  /**
   * Find all agency user records
   * @param {{
   *  agency_user_id?: string,
   * 	agency_fk?: string,
   * 	user_fk?: string,
   *  title?: string,
   * 	description?: string,
   * 	year_started?: number,
   * 	website?: string,
   * 	instagram?: string,
   * 	linkedin?: string,
   *  facebook?: string,
   *  youtube?: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ order?:Array, include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  agencyUserController.findAll = async (
    where,
    { order, include, transaction } = {},
  ) => {
    const funcName = 'agencyUserController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await agencyUserModel.findAll({
      where: { ...where },
      transaction,
      include,
      order,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one agency user record
   * @param {{
   *  agency_user_id?: string,
   * 	agency_fk?: string,
   * 	user_fk?: string,
   *  title?: string,
   * 	description?: string,
   * 	year_started?: number,
   * 	website?: string,
   * 	instagram?: string,
   * 	linkedin?: string,
   *  facebook?: string,
   *  youtube?: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  agencyUserController.findOne = async (
    where,
    { transaction, include } = {},
  ) => {
    const funcName = 'agencyUserController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await agencyUserModel.findOne({
      where: { ...where },
      transaction,
      include,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete agency user record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  agencyUserController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'agencyUserController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await agencyUserModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  agencyUserController.getEmailNotification = async (agency_id, type) => {
    const response = await Axios({
      url: `${config.apiUrl}/v1/services/email-notification-setting/can-send?agency_user_id=${agency_id}&type=${type}`,
      method: 'get',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-component-secret': config.component.secret,
      },
    });
    if (response && response.data) {
      console.log(response.data);
      return response.data.email_notification_settings;
    }
    return false;
  };

  return agencyUserController;
};
