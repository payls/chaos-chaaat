const constant = require('../constants/constant.json');
const h = require('../helpers');

module.exports.makeShortListedPropertyCommentController = (models) => {
  const { shortlisted_property_comment: shortlistPropertyCommentModel } =
    models;
  const shortlistPropertyCommentController = {};

  /**
   * Create shortlisted property comment record
   * @param {{
   *  shortlisted_property_fk?: string,
   *  contact_fk?: string,
   *  agency_user_fk?: string,
   *  user_fk?: string,
   *  contact_comment?: boolean,
   *  parent_comment_fk?: string,
   *  message?: string,
   *  comment_date?: string,
   *  status?: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortlistPropertyCommentController.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortListedPropertyController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      shortlisted_property_fk,
      contact_fk,
      agency_user_fk,
      user_fk,
      contact_comment,
      parent_comment_fk,
      message,
      comment_date,
      status,
      created_by,
    } = record;
    const shortlisted_property_comment_id = h.general.generateId();
    await shortlistPropertyCommentModel.create(
      {
        shortlisted_property_comment_id,
        shortlisted_property_fk,
        contact_fk,
        agency_user_fk,
        user_fk,
        contact_comment,
        parent_comment_fk,
        message,
        comment_date,
        status,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return shortlisted_property_comment_id;
  };

  /**
   * Update shortlisted property comment record
   * @param {string} shortlisted_property_comment_id
   * @param {{
   * 	shortlisted_property_fk?: string,
   *	contact_fk?: string,
   *  agency_user_fk?: string,
   *  user_fk?: string,
   *  contact_comment?: boolean,
   *  parent_comment_fk?: string,
   *	message?: string,
   *  comment_date?: string,
   *	status?: string,
   *	updated_by?: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortlistPropertyCommentController.update = async (
    shortlisted_property_comment_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistPropertyCommentController.update';
    h.validation.requiredParams(funcName, {
      shortlisted_property_comment_id,
      record,
    });
    const {
      shortlisted_property_fk,
      contact_fk,
      agency_user_fk,
      user_fk,
      contact_comment,
      parent_comment_fk,
      message,
      comment_date,
      status,
      updated_by,
    } = record;
    h.validation.validateConstantValue(
      funcName,
      { status: constant.SHORTLIST_PROPERTY.COMMENT.STATUS },
      { status },
    );
    await shortlistPropertyCommentModel.update(
      {
        shortlisted_property_fk,
        contact_fk,
        agency_user_fk,
        user_fk,
        contact_comment,
        parent_comment_fk,
        message,
        comment_date,
        status,
        updated_by,
      },
      { where: { shortlisted_property_comment_id }, transaction },
    );
    return shortlisted_property_comment_id;
  };

  /**
   * Find all active shortlisted property comment records given id
   * @param {{
   *  shortlisted_property_comment_id?: string,
   * 	shortlisted_property_fk?: string,
   * 	contact_fk?: string,
   * 	agency_user_fk?: string,
   *  user_fk?: string,
   *  contact_comment?: boolean,
   * 	parent_comment_fk?: string,
   *	message?: string,
   *  comment_date?: string,
   *	status?: string,
   *	created_by?: string,
   *	updated_by?: string
   * }} where
   * @param {{ order?:Array, include?:Array, transaction?:object, offset?:number, limit?:number , subQuery?:boolean}} [options]
   * @returns {Promise<Array>}
   */
  shortlistPropertyCommentController.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery = false } = {},
  ) => {
    const funcName = 'shortlistPropertyCommentController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await shortlistPropertyCommentModel.findAll({
      where: {
        ...where,
        status: constant.SHORTLIST_PROPERTY.COMMENT.STATUS.ACTIVE,
      },
      transaction,
      include,
      order,
      offset,
      limit,
      subQuery,
    });
    return h.database.formatData(records);
  };

  /**
   * Count all active shortlisted property comment records given id
   * @param {{
   *  shortlisted_property_comment_id?: string,
   * 	shortlisted_property_fk?: string,
   * 	contact_fk?: string,
   * 	agency_user_fk?: string,
   *  user_fk?: string,
   *  contact_comment?: boolean,
   * 	parent_comment_fk?: string,
   *	message?: string,
   *  comment_date?: string,
   *	status?: string,
   *	created_by?: string,
   *	updated_by?: string
   * }} where
   * @param {{ order?:Array, include?:Array, transaction?:object, subQuery?:boolean }} [options]
   * @returns {Promise<Array>}
   */
  shortlistPropertyCommentController.count = async (
    where,
    { include, transaction, subQuery } = {},
  ) => {
    const funcName = 'shortlistPropertyCommentController.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await shortlistPropertyCommentModel.count({
      where: {
        ...where,
        status: constant.SHORTLIST_PROPERTY.COMMENT.STATUS.ACTIVE,
      },
      distinct: true,
      transaction,
      include,
      subQuery,
    });
    return h.database.formatData(records);
  };

  /**
   * Find an active shortlisted property comment record given id
   * @param {{
   *  shortlisted_property_comment_id?: string,
   * 	shortlisted_property_fk?: string,
   * 	contact_fk?: string,
   * 	agency_user_fk?: string,
   *  user_fk?: string,
   *  contact_comment?: boolean,
   * 	parent_comment_fk?: string,
   *	message?: string,
   *  comment_date?: string,
   *	status?: string,
   *	created_by?: string,
   *	updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  shortlistPropertyCommentController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'shortlistPropertyCommentController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await shortlistPropertyCommentModel.findOne({
      where: {
        ...where,
        status: constant.SHORTLIST_PROPERTY.COMMENT.STATUS.ACTIVE,
      },
      transaction,
      include,
    });
    return h.database.formatData(record);
  };

  /**
   * Soft delete shortlisted property comment record
   * @param {{
   * 	shortlisted_property_fk?: string,
   * 	contact_fk?: string,
   * 	agency_user_fk?: string,
   *  user_fk?: string,
   *  contact_comment?: boolean,
   * 	parent_comment_fk?: string,
   *	message?: string,
   *  comment_date?: string,
   *	status?: string,
   *	created_by?: string,
   *	updated_by?: string
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  shortlistPropertyCommentController.delete = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistPropertyCommentController.delete';
    h.validation.requiredParams(funcName, { where });
    const { shortlisted_property_comment_id } =
      await shortlistPropertyCommentModel.findOne(where, { transaction });
    await shortlistPropertyCommentModel.update(
      shortlisted_property_comment_id,
      { status: constant.SHORTLIST_PROPERTY.COMMENT.STATUS.DELETED },
      { transaction },
    );
  };

  /**
   * Hard delete shortlisted property comment record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  shortlistPropertyCommentController.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistPropertyCommentController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await shortlistPropertyCommentModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return shortlistPropertyCommentController;
};
