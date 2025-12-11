const h = require('../helpers');
const constant = require('../constants/constant.json');
const { constants } = require('crypto');

module.exports.makeController = (models) => {
  const { email_notification_setting: emailNotificationSettingModel } = models;
  const emailNotificationSettingController = {};

  /**
   * Create email notification setting user record
   * @param {{
   * 	agency_user_fk: string,
   * 	notification_type: string,
   * 	status: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  emailNotificationSettingController.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'emailNotificationSettingController.create';
    h.validation.requiredParams(funcName, { record });
    const { agency_user_fk, notification_type, status } = record;
    const email_notification_setting_id = h.general.generateId();
    await emailNotificationSettingModel.create(
      {
        email_notification_setting_id,
        agency_user_fk,
        notification_type,
        status,
      },
      { transaction },
    );
    return email_notification_setting_id;
  };

  /**
   * Update email notification setting record
   * @param {string} agency_user_id
   * @param {{
   * 	agency_user_fk: string,
   * 	notification_type: string,
   * 	status: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  emailNotificationSettingController.update = async (
    where,
    record,
    { transaction } = {},
  ) => {
    const { agency_user_fk, notification_type, status } = record;
    const ups = await emailNotificationSettingModel.update(
      {
        agency_user_fk,
        notification_type,
        status,
      },
      { where, transaction },
    );
    return ups.email_notification_setting_id;
  };

  /**
   * Find all email notification setting records
   * @param {{
   * 	agency_user_fk: string,
   * 	notification_type: string,
   * 	status: string,
   * }} where
   * @param {{ order?:Array, include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  emailNotificationSettingController.findAll = async (
    where,
    { order, include, transaction, attributes } = {},
  ) => {
    const funcName = 'emailNotificationSettingController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await emailNotificationSettingModel.findAll({
      where: { ...where },
      transaction,
      include,
      order,
      attributes,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one email notification setting record
   * @param {{
   * 	agency_user_fk: string,
   * 	notification_type: string,
   * 	status: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  emailNotificationSettingController.findOne = async (
    where,
    { transaction, include } = {},
  ) => {
    const funcName = 'emailNotificationSettingController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await emailNotificationSettingModel.findOne({
      where: { ...where },
      transaction,
      include,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete email notification setting record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  emailNotificationSettingController.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'emailNotificationSettingController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await emailNotificationSettingModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Return true if email notification of agent is true
   */
  emailNotificationSettingController.ifCanSendEmail = async (
    agency_user_fk,
    type,
  ) => {
    const emailNotif = await emailNotificationSettingModel.findOne({
      where: {
        agency_user_fk,
        notification_type: type,
      },
    });

    // Return true if no record
    if (h.isEmpty(emailNotif)) {
      switch (type) {
        // Email notifs that is default to false
        case constant.EMAIL_NOTIFICATION_TYPE.CREATE_NEW_LEAD:
        case constant.EMAIL_NOTIFICATION_TYPE.UPDATE_NEW_LEAD:
          return false;

        // Email notifs that is default to true
        case constant.EMAIL_NOTIFICATION_TYPE.ENGAGEMENT_SUMMARY:
        case constant.EMAIL_NOTIFICATION_TYPE.WEEKLY_SUMMARY:
        case constant.EMAIL_NOTIFICATION_TYPE.PROPOSAL_RATING:
        case constant.EMAIL_NOTIFICATION_TYPE.PROPOSAL_PROPERTY_RESERVE:
        case constant.EMAIL_NOTIFICATION_TYPE.PROPOSAL_ENQUIRY:
        case constant.EMAIL_NOTIFICATION_TYPE.PROPOSAL_COMMENT:
          return true;
        default:
          return false;
      }
    } else {
      const { status } = emailNotif;
      return status;
    }
  };

  return emailNotificationSettingController;
};
