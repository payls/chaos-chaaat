const h = require('../helpers');
const { Op } = require('sequelize');
const config = require('../configs/config')(process.env.NODE_ENV);
const constant = require('../constants/constant.json');

module.exports.makeController = (models) => {
  const { proposal_template: proposalTemplateModel } = models;

  const proposalTemplateController = {};

  /**
   * Create proposal_template record
   * @param {{
   *  name?: string,
   * 	agency_fk: string,
   *  email_subject: string,
   *  email_body: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  proposalTemplateController.create = async (record, { transaction } = {}) => {
    const funcName = 'proposalTemplateController.create';
    h.validation.requiredParams(funcName, { record });
    const { agency_fk, name, email_subject, email_body, created_by } = record;
    const proposal_template_id = h.general.generateId();
    await proposalTemplateModel.create(
      {
        proposal_template_id,
        agency_fk,
        name,
        email_subject,
        email_body,
        created_by,
      },
      { transaction },
    );

    return proposal_template_id;
  };

  /**
   * Update proposal_template record
   * @param {string} contact_id
   * @param {{
   * 	name?: string,
   * 	agency_fk: string,
   * 	is_draft?: boolean,
   *  email_subject: string,
   *  email_body: string,
   * 	is_deleted?: boolean,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  proposalTemplateController.update = async (
    proposal_template_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'proposalTemplateController.update';
    h.validation.requiredParams(funcName, { record });
    const { agency_fk, name, email_subject, email_body, is_draft, is_deleted } =
      record;
    await proposalTemplateModel.update(
      {
        agency_fk,
        name,
        is_draft,
        email_subject,
        email_body,
        is_deleted,
        updated_by,
      },
      { where: { proposal_template_id }, transaction },
    );
    return proposal_template_id;
  };

  /**
   * Find all proposal_template records
   * @param {{
   *  proposal_template_id?: string,
   * 	name?: string,
   * 	agency_fk: string,
   * 	agency_user_fk: string,
   * 	is_draft?: boolean,
   *  email_subject: string,
   *  email_body: string,
   * 	is_deleted?: boolean,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  proposalTemplateController.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'proposalTemplateController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await proposalTemplateModel.findAll({
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
   * Find one proposal_template record
   * @param {{
   *  proposal_template_id?: string,
   * 	name?: string,
   * 	agency_fk: string,
   * 	agency_user_fk: string,
   * 	is_draft?: boolean,
   *  email_subject: string,
   *  email_body: string,
   * 	is_deleted?: boolean,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  proposalTemplateController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'proposalTemplateController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await proposalTemplateModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete contact record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  proposalTemplateController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'proposalTemplateController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await proposalTemplateModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Soft delete contact record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  proposalTemplateController.softDelete = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'proposalTemplateController.softDelete';
    h.validation.requiredParams(funcName, { where });
    await proposalTemplateModel.update(
      {
        is_deleted: true,
      },
      { where: { ...where }, transaction },
    );
  };

  return proposalTemplateController;
};
