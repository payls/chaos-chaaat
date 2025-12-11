const h = require('../helpers');

module.exports.makeController = (models) => {
  const { sf_contact_opportunity: sfContactOpportunityModel } = models;

  const sfContactOpportunityCtl = {};

  /**
   * Create sf_contact_opportunity record
   * @param {{
   *  sf_contact_opportunity_id?: string,
   * 	agency_fk: string,
   *  attributes: string,
   *  Id: string,
   *  OpportunityId: string,
   *  ContactId: string,
   *  IsPrimary: boolean,
   *  CreatedDate: date,
   *  CreatedById: string,
   *  LastModifiedDate: date,
   *  LastModifiedById: string,
   *  SystemModstamp: date,
   *  IsDeleted: boolean,
   *	created_by: string,
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */

  sfContactOpportunityCtl.create = async (record, { transaction } = {}) => {
    const funcName = 'sfContactOpportunityCtl.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      attributes,
      Id,
      OpportunityId,
      ContactId,
      IsPrimary,
      CreatedDate,
      CreatedById,
      LastModifiedDate,
      LastModifiedById,
      SystemModstamp,
      IsDeleted,
      created_by,
    } = record;
    const sf_contact_opportunity_id = h.general.generateId();
    await sfContactOpportunityModel.create(
      {
        sf_contact_opportunity_id,
        agency_fk,
        attributes,
        Id,
        ContactId,
        OpportunityId,
        IsPrimary,
        CreatedDate,
        CreatedById,
        LastModifiedDate,
        LastModifiedById,
        SystemModstamp,
        IsDeleted,
        created_by,
      },
      { transaction },
    );

    return sf_contact_opportunity_id;
  };

  /**
   * Update sf_contact_opportunity record
   * @param {string} sf_contact_opportunity_id
   * @param {{
   * 	agency_fk: string,
   *  attributes: string,
   *  Id: string,
   *  OpportunityId: string,
   *  ContactId: string,
   *  IsPrimary: boolean,
   *  CreatedDate: date,
   *  CreatedById: string,
   *  LastModifiedDate: date,
   *  LastModifiedById: string,
   *  SystemModstamp: date,
   *  IsDeleted: boolean,
   *	created_by: string,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  sfContactOpportunityCtl.update = async (
    sf_contact_opportunity_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'sfContactOpportunityCtl.update';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_fk,
      attributes,
      Id,
      OpportunityId,
      ContactId,
      IsPrimary,
      CreatedDate,
      CreatedById,
      LastModifiedDate,
      LastModifiedById,
      SystemModstamp,
      IsDeleted,
    } = record;
    await sfContactOpportunityModel.update(
      {
        agency_fk,
        attributes,
        Id,
        OpportunityId,
        ContactId,
        IsPrimary,
        CreatedDate,
        CreatedById,
        LastModifiedDate,
        LastModifiedById,
        SystemModstamp,
        IsDeleted,
        updated_by,
      },
      { where: { sf_contact_opportunity_id }, transaction },
    );
    return sf_contact_opportunity_id;
  };

  /**
   * Find all sf_contact_opportunity records
   * @param {{
   *  sf_contact_opportunity_id: string,
   * 	agency_fk: string,
   *  attributes: string,
   *  Id: string,
   *  OpportunityId: string,
   *  ContactId: string,
   *  IsPrimary: boolean,
   *  CreatedDate: date,
   *  CreatedById: string,
   *  LastModifiedDate: date,
   *  LastModifiedById: string,
   *  SystemModstamp: date,
   *  IsDeleted: boolean,
   *	created_by: string,
   *	updated_by: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  sfContactOpportunityCtl.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'sfContactOpportunityCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await sfContactOpportunityModel.findAll({
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
   * Find one sf_contact_opportunity record
   * @param {{
   *  sf_contact_opportunity_id: string,
   * 	agency_fk: string,
   *  attributes: string,
   *  Id: string,
   *  OpportunityId: string,
   *  ContactId: string,
   *  IsPrimary: boolean,
   *  CreatedDate: date,
   *  CreatedById: string,
   *  LastModifiedDate: date,
   *  LastModifiedById: string,
   *  SystemModstamp: date,
   *  IsDeleted: boolean,
   *	created_by: string,
   *	updated_by: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  sfContactOpportunityCtl.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'sfContactOpportunityCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await sfContactOpportunityModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete sf_contact_opportunity record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  sfContactOpportunityCtl.destroy = async (where, { transaction } = {}) => {
    const funcName = 'proposalTemplateController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await sfContactOpportunityModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Soft delete sf_contact_opportunity record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  sfContactOpportunityCtl.softDelete = async (where, { transaction } = {}) => {
    const funcName = 'sfContactOpportunityCtl.softDelete';
    h.validation.requiredParams(funcName, { where });
    await sfContactOpportunityModel.update(
      {
        IsDeleted: true,
      },
      { where: { ...where }, transaction },
    );
  };

  return sfContactOpportunityCtl;
};
