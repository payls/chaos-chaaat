const h = require('../helpers');
const constant = require('../constants/constant.json');
const portal = constant.PORTAL.WEBAPP_ADMIN;

module.exports.makeContactSourceController = (models) => {
  const { contact_source: contactSourceModel } = models;
  const contactSourceController = {};

  /**
   * Create contact record
   * @param {{
   *  first_name?: string,
   *  last_name?: string,
   *  email?: string,
   *  mobile_number?: string,
   *  permalink?: string,
   *  profile_picture_url?: string,
   * 	agency_fk: string,
   * 	agency_user_fk: string,
   * 	status: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  contactSourceController.create = async (record, { transaction } = {}) => {
    const funcName = 'contactSourceController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      contact_fk,
      created_by,
      source_type = null,
      source_contact_id = null,
      source_original_payload = null,
    } = record;
    const contact_source_id = h.general.generateId();
    await contactSourceModel.create(
      {
        contact_source_id,
        contact_fk,
        source_contact_id: source_contact_id ?? contact_fk,
        source_type: source_type ?? portal,
        source_meta: null,
        source_original_payload: source_original_payload ?? null,
        created_by,
        updated_by: null,
      },
      { transaction },
    );
    return contact_source_id;
  };

  /**
   * Find one contact record
   * @param {{
   *  contact_source_id?: string,
   * 	contact_fk?: string,
   *  source_contact_id?: string,
   *  source_type?: string,
   *  source_meta?: string
   *  source_original_payload?: string,
   *  created_by?: string
   *  created_date?: string
   * 	updated_by: string,
   * 	updated_date: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  contactSourceController.findOne = async (where, { transaction } = {}) => {
    const funcName = 'contactSourceController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await contactSourceModel.findOne({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(record);
  };

  contactSourceController.update = async (
    source_contact_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'ctr.update';
    h.validation.requiredParams(funcName, {
      source_contact_id,
      record,
    });
    const { contact_fk, source_type, source_original_payload } = record;
    await contactSourceModel.update(
      {
        contact_fk,
        source_type,
        source_original_payload,
      },
      { where: { source_contact_id }, transaction },
    );
    return source_contact_id;
  };

  contactSourceController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'contactSourceController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await contactSourceModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return contactSourceController;
};
