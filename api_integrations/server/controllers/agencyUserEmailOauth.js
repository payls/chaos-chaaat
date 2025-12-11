const h = require('../helpers');

module.exports.makeAgencyUserEmailOauthController = (models) => {
  const { agency_user_email_oauth: agencyUserEmailOauth } = models;
  const agencyUserEmailOauthController = {};

  /**
   * Create agency_user_email_oauth record
   * @param {{
   *	agency_user_fk:string,
   *	status:string,
   *	source:string,
   *	access_info:string,
   *	created_by?:string
   * }} agencyUserEmailOauthData
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  agencyUserEmailOauthController.create = async (
    agencyUserEmailOauthData,
    { transaction } = {},
  ) => {
    const funcName = 'agencyUserEmailOauthController.create';
    const { agency_user_fk, status, source, access_info, created_by } =
      agencyUserEmailOauthData;
    h.validation.requiredParams(funcName, {
      agencyUserEmailOauthData,
      agency_user_fk,
      source,
      status,
      access_info,
    });

    const agency_user_email_oauth_id = h.general.generateId();
    await agencyUserEmailOauth.create(
      {
        agency_user_email_oauth_id,
        agency_user_fk,
        source,
        status,
        access_info,
        created_by: created_by,
      },
      { transaction },
    );
    return agency_user_email_oauth_id;
  };

  /**
   * Update agency_user_email_oauth record
   * @param {string} agency_user_email_oauth_id
   * @param {{
   *	agency_user_fk:string,
   *	status:string,
   *	source:string,
   *	access_info?:string,
   *	updated_by?:string
   * }} userSocialAuthData
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  agencyUserEmailOauthController.update = async (
    agency_user_email_oauth_id,
    agencyUserEmailOauthData,
    { transaction } = {},
  ) => {
    const { agency_user_fk, status, source, access_info, updated_by } =
      agencyUserEmailOauthData;

    await agencyUserEmailOauth.update(
      {
        agency_user_fk,
        status,
        source,
        access_info,
        updated_by,
      },
      {
        where: { agency_user_email_oauth_id },
        transaction,
      },
    );
    console.log();
    return agency_user_email_oauth_id;
  };

  /**
   * Find agency_user_email_oauth record by user id
   * @param {{
   *    agency_user_email_oauth_id?:string,
   *	agency_user_fk?:string,
   *	status?:string,
   *	source?:string,
   *	access_info?:string,
   *	created_by?:string
   *	updated?:string
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<object>}
   */
  agencyUserEmailOauthController.findOne = async (
    where,
    { transaction, attributes } = {},
  ) => {
    const funcName = 'agencyUserEmailOauthController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const userSocialAuth = await agencyUserEmailOauth.findOne({
      where: { ...where },
      transaction,
      attributes,
    });
    return h.database.formatData(userSocialAuth);
  };

  /**
   * Hard delete user_social_auth record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  agencyUserEmailOauthController.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'agencyUserEmailOauthController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await agencyUserEmailOauth.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return agencyUserEmailOauthController;
};
