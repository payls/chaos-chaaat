const Sentry = require('@sentry/node');
const h = require('../helpers');
const { Op } = require('sequelize');
const config = require('../configs/config')(process.env.NODE_ENV);
const constant = require('../constants/constant.json');
const sequelize = require('sequelize');

module.exports.makeController = (models) => {
  const { waba_template: wabaTemplateModel } = models;

  const wabaTemplate = {};

  /**
   * Find all waba_template records
   * @param {{
   *  waba_template_id: string,
   *  agency_fk: string,
   *  template_id: string,
   *  template_name: string,
   *  waba_number: string,
   *  content: text,
   *  header_image: text,
   *  category: string,
   *  status: string,
   *  language: string,
   *  template_order: number,
   *  visible: boolean,
   *  is_edited: boolean,
   *  last_edit_date: date,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  wabaTemplate.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery, group } = {},
  ) => {
    const funcName = 'wabaTemplate.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await wabaTemplateModel.findAll({
      where: { ...where },
      offset,
      limit,
      subQuery,
      include,
      transaction,
      order,
      group,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one waba_template record
   * @param {{
   *  waba_template_id: string,
   *  agency_fk: string,
   *  template_id: string,
   *  template_name: string,
   *  waba_number: string,
   *  content: text,
   *  header_image: text,
   *  category: string,
   *  status: string,
   *  language: string,
   *  template_order: number,
   *  visible: boolean,
   *  is_edited: boolean,
   *  last_edit_date: date,
   *	updated_by: string,
   *  created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  wabaTemplate.findOne = async (
    where,
    { order, include, transaction, attributes } = {},
  ) => {
    const funcName = 'wabaTemplate.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await wabaTemplateModel.findOne({
      where: { ...where },
      order,
      include,
      transaction,
      attributes,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete waba_template record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  wabaTemplate.destroy = async (where, { transaction } = {}) => {
    const funcName = 'wabaTemplate.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await wabaTemplateModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Create waba_template record
   * @param {{
   *  agency_fk: string,
   *  template_id: string,
   *  template_name: string,
   *  waba_number: string,
   *  content: string,
   *  header_image: string,
   *  category: string,
   *  language: string,
   *  status: string,
   *  variable_identifier: string,
   *  is_draft: boolean,
   *  visible: boolean,
   *  template_order: number,
   *  created_by: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  wabaTemplate.create = async (record, { transaction } = {}) => {
    const funcName = 'wabaTemplate.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      template_id,
      template_name,
      waba_number,
      content,
      header_image,
      category,
      language,
      status,
      variable_identifier,
      is_draft,
      visible,
      template_order,
      created_by,
    } = record;
    const waba_template_id = h.general.generateId();
    await wabaTemplateModel.create(
      {
        waba_template_id,
        agency_fk,
        template_id,
        template_name,
        waba_number,
        content,
        header_image,
        category,
        language,
        status,
        variable_identifier,
        is_draft,
        visible,
        template_order,
        created_by,
      },
      { transaction },
    );

    return waba_template_id;
  };

  /**
   * Description
   * Function to delete all templates not available in Meta
   * @async
   * @constant
   * @name deleteNonMetaTemplates
   * @param {object} data object data to be used for deleting non meta templates
   */
  wabaTemplate.deleteNonMetaTemplates = async (data) => {
    const funcName = 'wabaTemplate.deleteNonMetaTemplates';
    const { agency_id, waba_number, meta_templates } = data;
    h.validation.requiredParams(funcName, { meta_templates });
    const transaction = await models.sequelize.transaction();
    try {
      /**
       * deleting waba template records in the database under the waba number of
       * the agency being processed
       */
      await wabaTemplateModel.destroy({
        where: {
          agency_fk: agency_id, // limit to agency
          waba_number: waba_number, // limit to the waba number of the config
          status: {
            [Op.ne]: 'DRAFT',
          },
          template_id: {
            [Op.notIn]: meta_templates,
          },
        },
        transaction,
      });
      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      Sentry.captureException(err);
      throw new Error(err);
    }
  };

  /**
   * Description
   * Function to do template database table syncing
   * @name processWhatsAppTemplateSync
   * @param {object} db_template currently saved version of the template
   * @param {object} template_data the new version of the template
   */
  wabaTemplate.processWhatsAppTemplateSync = async (
    db_template,
    template_data,
  ) => {
    const transaction = await models.sequelize.transaction();
    try {
      /**
       * if there is an existing template in the database, allow updating the
       * template record
       */
      if (
        h.notEmpty(db_template) &&
        template_data.status !== db_template.status
      ) {
        await models.waba_template.update(template_data, {
          where: {
            waba_template_id: db_template?.waba_template_id,
          },
          transaction,
        });
      }
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      Sentry.captureException(err);
      throw new Error(err);
    }
  };

  /**
   * Count waba_template record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  wabaTemplate.count = async (where, { include, transaction } = {}) => {
    const funcName = 'wabaTemplate.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await wabaTemplateModel.count({
      where: { ...where },
      distinct: true,
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  return wabaTemplate;
};
