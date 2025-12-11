const h = require('../helpers');

module.exports.makeContactViewPropertyController = (models) => {
  const { contact_view_property: contactViewPropertyModel } = models;

  const contactViewPropertyController = {};

  /**
   * Create contact_view_property record
   * @param {{
   *  contact_view_fk: string,
   *  agency_user_fk: string,
   *  is_pinned: boolean,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactViewPropertyController.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = ' contactViewPropertyController.create';
    h.validation.requiredParams(funcName, { record });
    const { contact_view_fk, agency_user_fk, is_pinned, created_by } = record;
    const contact_view_property_id = h.general.generateId();
    await contactViewPropertyModel.create(
      {
        contact_view_property_id,
        contact_view_fk,
        agency_user_fk,
        is_pinned,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return contact_view_property_id;
  };

  /**
   * Update  contact_view_property record
   * @param {string}  contact_view_property_id
   * @param {{
   *  contact_view_fk: string,
   *  agency_user_fk: string,
   *  is_pinned: boolean,
   * 	created_by: string,
   * 	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactViewPropertyController.update = async (
    contact_view_property_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = ' contactViewPropertyController.update';
    h.validation.requiredParams(funcName, { contact_view_property_id, record });
    const { contact_view_fk, agency_user_fk, is_pinned, updated_by } = record;
    await contactViewPropertyModel.update(
      {
        contact_view_fk,
        agency_user_fk,
        is_pinned,
        updated_by,
      },
      { where: { contact_view_property_id }, transaction },
    );
    return contact_view_property_id;
  };

  /**
   * Bulk Update  contact_view_property record
   * @param {{
   *  contact_view_property_id?: string,
   *  contact_view_fk: string,
   *  agency_user_fk: string,
   *  is_pinned: boolean,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{
   *  contact_view_fk: string,
   *  agency_user_fk: string,
   *  is_pinned: boolean,
   * 	created_by: string,
   * 	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactViewPropertyController.bulkUpdate = async (
    where,
    record,
    { transaction } = {},
  ) => {
    const funcName = ' contactViewPropertyController.bulkUpdate';
    h.validation.requiredParams(funcName, { where, record });
    const { contact_view_fk, agency_user_fk, is_pinned, updated_by } = record;
    return await contactViewPropertyModel.update(
      {
        contact_view_fk,
        agency_user_fk,
        is_pinned,
        updated_by,
      },
      { where: { ...where }, transaction },
    );
  };

  /**
   * Find all  contact_view_property records
   * @param {{
   *  contact_view_property_id?: string,
   *  contact_view_fk: string,
   *  agency_user_fk: string,
   *  is_pinned: boolean,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  contactViewPropertyController.findAll = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = ' contactViewPropertyController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await contactViewPropertyModel.findAll({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one  contact_view_property record
   * @param {{
   *  contact_view_property_id?: string,
   *  contact_view_fk: string,
   *  agency_user_fk: string,
   *  is_pinned: boolean,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  contactViewPropertyController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = ' contactViewPropertyController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await contactViewPropertyModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Find or create a contactViewProperty
   * @param where
   * @param defaults
   * @param transaction
   * @returns {Promise<{created: *, record: (Object|Array)}>}
   */
  contactViewPropertyController.findOrCreate = async (
    where,
    defaults,
    { transaction } = {},
  ) => {
    const funcName = 'contactViewPropertyController.findOrCreate';

    /* Implementation using the findOrCreate from sequelize */
    h.validation.requiredParams(funcName, { where, defaults });

    const { contact_view_fk, agency_user_fk, is_pinned, created_by } = defaults;

    h.validation.requiredParams(funcName, { contact_view_fk, agency_user_fk });

    const contact_view_property_id = h.general.generateId();

    const [record, created] = await contactViewPropertyModel.findOrCreate({
      where: { ...where },
      defaults: {
        contact_view_property_id,
        contact_view_fk,
        agency_user_fk,
        is_pinned,
        created_by,
        updated_by: created_by,
      },
      transaction,
    });

    return { record: h.database.formatData(record), created: created };
  };

  /**
   * Hard delete task record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  contactViewPropertyController.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = ' contactViewPropertyController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await contactViewPropertyModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return contactViewPropertyController;
};
