const h = require('../helpers');

module.exports.makeController = (models) => {
  const { agency_custom_landing_pages: agencyCustomLandingPageModel } = models;
  const agencyCustomLandingPageController = {};

  /**
   * Create custom landing page user record
   * @param {{
   * 	agency_fk: string,
   * 	landing_page: string,
   *  landing_page_slug: string
   * 	status: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  agencyCustomLandingPageController.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'agencyCustomLandingPageController.create';
    h.validation.requiredParams(funcName, { record });
    const { agency_fk, landing_page_name, landing_page, landing_page_slug } =
      record;
    const agency_custom_landing_page_id = h.general.generateId();
    await agencyCustomLandingPageModel.create(
      {
        agency_custom_landing_page_id,
        agency_fk,
        landing_page_name,
        landing_page,
        landing_page_slug,
      },
      { transaction },
    );
    return agency_custom_landing_page_id;
  };

  /**
   * Update custom landing page record
   * @param {string} agency_user_id
   * @param {{
   * 	agency_fk: string,
   * 	landing_page: string,
   *  landing_page_name: string
   *  landing_page_slug: string
   * 	status: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  agencyCustomLandingPageController.update = async (
    agency_custom_landing_page_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'agencyCustomLandingPageController.update';
    h.validation.requiredParams(funcName, {
      agency_custom_landing_page_id,
      record,
    });
    const {
      agency_fk,
      landing_page_name,
      landing_page,
      landing_page_slug,
      status,
    } = record;
    await agencyCustomLandingPageModel.update(
      {
        agency_fk,
        landing_page_name,
        landing_page,
        landing_page_slug,
        status,
      },
      { where: { agency_custom_landing_page_id }, transaction },
    );
    return agency_custom_landing_page_id;
  };

  /**
   * Find all custom landing page records
   * @param {{
   * 	agency_fk: string,
   * 	landing_page: string,
   *  landing_page_slug: string
   * 	status: string,
   * }} where
   * @param {{ order?:Array, include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  agencyCustomLandingPageController.findAll = async (
    where,
    { order, include, transaction } = {},
  ) => {
    const funcName = 'agencyCustomLandingPageController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await agencyCustomLandingPageModel.findAll({
      where: { ...where },
      transaction,
      include,
      order,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one custom landing page record
   * @param {{
   * 	agency_fk: string,
   * 	landing_page: string,
   *  landing_page_slug: string
   * 	status: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  agencyCustomLandingPageController.findOne = async (
    where,
    { transaction, include } = {},
  ) => {
    const funcName = 'agencyCustomLandingPageController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await agencyCustomLandingPageModel.findOne({
      where: { ...where },
      transaction,
      include,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete custom landing page record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  agencyCustomLandingPageController.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'agencyCustomLandingPageController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await agencyCustomLandingPageModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return agencyCustomLandingPageController;
};
