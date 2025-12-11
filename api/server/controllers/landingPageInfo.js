const h = require('../helpers');

module.exports.makeController = (models) => {
  const { landing_page_info: landingPageInfoModel } = models;
  const landingPageInfoController = {};

  /**
   * Create custom landing page info record
   * @param {{
   * 	agency_custom_landing_page_fk: string,
   * 	landing_page_data: string
   * 	landing_page_html: string
   * 	landing_page_css: string
   * 	meta_title: string
   * 	meta_description: string
   * 	meta_image: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  landingPageInfoController.create = async (record, { transaction } = {}) => {
    const funcName = 'landingPageInfoController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_custom_landing_page_fk,
      landing_page_data,
      landing_page_html,
      landing_page_css,
      meta_title,
      meta_description,
      meta_image,
    } = record;
    const landing_page_info_id = h.general.generateId();
    await landingPageInfoModel.create(
      {
        landing_page_info_id,
        agency_custom_landing_page_fk,
        landing_page_data,
        landing_page_html,
        landing_page_css,
        meta_title,
        meta_description,
        meta_image,
      },
      { transaction },
    );
    return landing_page_info_id;
  };

  /**
   * Update landing page record
   * @param {string} agency_user_id
   * @param {{
   * 	agency_custom_landing_page_fk: string,
   * 	landing_page_data: string
   * 	landing_page_html: string
   * 	landing_page_css: string
   * 	meta_title: string
   * 	meta_description: string
   * 	meta_image: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  landingPageInfoController.update = async (
    landing_page_info_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'landingPageInfoController.update';
    h.validation.requiredParams(funcName, {
      landing_page_info_id,
      record,
    });
    const {
      agency_custom_landing_page_fk,
      landing_page_data,
      landing_page_html,
      landing_page_css,
      meta_title,
      meta_description,
      meta_image,
    } = record;
    await landingPageInfoModel.update(
      {
        agency_custom_landing_page_fk,
        landing_page_data,
        landing_page_html,
        landing_page_css,
        meta_title,
        meta_description,
        meta_image,
      },
      { where: { landing_page_info_id }, transaction },
    );
    return landing_page_info_id;
  };

  /**
   * Find all landing page records
   * @param {{
   * 	agencagency_custom_landing_page_fky_fk: string,
   * 	landing_page_data: string
   * }} where
   * @param {{ order?:Array, include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  landingPageInfoController.findAll = async (
    where,
    { order, include, transaction } = {},
  ) => {
    const funcName = 'landingPageInfoController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await landingPageInfoModel.findAll({
      where: { ...where },
      transaction,
      include,
      order,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one landing page record
   * @param {{
   * 	agency_fk: string,
   * 	landing_page: string,
   *  landing_page_slug: string
   * 	status: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  landingPageInfoController.findOne = async (
    where,
    { transaction, include } = {},
  ) => {
    const funcName = 'landingPageInfoController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await landingPageInfoModel.findOne({
      where: { ...where },
      transaction,
      include,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete landing page record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  landingPageInfoController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'landingPageInfoController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await landingPageInfoModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return landingPageInfoController;
};
