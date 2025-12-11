const h = require('../helpers');

module.exports.makeLocationController = (models) => {
  const { location: locationModel } = models;
  const locationController = {};

  /**
   * Create location record
   * @param {{
   *  project_location_map_fk: string,
   *  project_location_nearby_fk: string,
   *  name: string,
   *  address: string,
   *  lat: number,
   *  lng: number,
   *  google_map_url: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  locationController.create = async (record, { transaction } = {}) => {
    const funcName = 'locationController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      project_location_map_fk,
      project_location_nearby_fk,
      name,
      address,
      lat,
      lng,
      google_map_url,
      created_by,
    } = record;

    const location_id = h.general.generateId();
    await locationModel.create(
      {
        location_id,
        project_location_map_fk,
        project_location_nearby_fk,
        name,
        address,
        lat,
        lng,
        google_map_url,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return location_id;
  };

  /**
   * Update location record
   * @param {string} location_id
   * @param {{
   *  project_location_map_fk: string,
   *  project_location_nearby_fk: string,
   *  name: string,
   *  address: string,
   *  lat: number,
   *  lng: number,
   *  google_map_url: string,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  locationController.update = async (
    location_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'locationController.update';
    h.validation.requiredParams(funcName, { location_id, record });
    const {
      project_location_map_fk,
      project_location_nearby_fk,
      name,
      address,
      lat,
      lng,
      google_map_url,
      updated_by,
    } = record;
    await locationModel.update(
      {
        project_location_map_fk,
        project_location_nearby_fk,
        name,
        address,
        lat,
        lng,
        google_map_url,
        updated_by,
      },
      { where: { location_id }, transaction },
    );
    return location_id;
  };

  /**
   * Find all location records
   * @param {{
   *  location_id: string,
   *  project_location_map_fk: string,
   *  project_location_nearby_fk: string,
   *  name: string,
   *  address: string,
   *  lat: number,
   *  lng: number,
   *  google_map_url: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  locationController.findAll = async (
    where,
    { include, transaction, order } = {},
  ) => {
    const funcName = 'locationController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await locationModel.findAll({
      where: { ...where },
      include,
      transaction,
      order,
    });
    return h.database.formatData(records);
  };

  /**
   * Find single location record
   * @param {{
   *  location_id: string,
   *  project_location_map_fk: string,
   *  project_location_nearby_fk: string,
   *  name: string,
   *  address: string,
   *  lat: number,
   *  lng: number,
   *  google_map_url: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  locationController.findOne = async (where, { include, transaction } = {}) => {
    const funcName = 'locationController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await locationModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Hard delete location record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  locationController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'locationController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await locationModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return locationController;
};
