const constant = require('../constants/constant.json');
const h = require('../helpers');

module.exports.makeShortListedProjectCommentController = (models) => {
  const { shortlisted_project_comment: shortlistProjectCommentModel } = models;
  const shortlistProjectCommentController = {};

  /**
   * Create shortlisted project comment record
   * @param {{
   *  shortlisted_project_fk?: string,
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
  shortlistProjectCommentController.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistProjectCommentController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      shortlisted_project_fk,
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
    const shortlisted_project_comment_id = h.general.generateId();
    await shortlistProjectCommentModel.create(
      {
        shortlisted_project_comment_id,
        shortlisted_project_fk,
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
    return shortlisted_project_comment_id;
  };

  /**
   * Update shortlisted project comment record
   * @param {string} shortlisted_project_comment_id
   * @param {{
   * 	shortlisted_project_fk?: string,
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
  shortlistProjectCommentController.update = async (
    shortlisted_project_comment_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistProjectCommentController.update';
    h.validation.requiredParams(funcName, {
      shortlisted_project_comment_id,
      record,
    });
    const {
      shortlisted_project_fk,
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
      { status: constant.SHORTLIST_PROJECT.COMMENT.STATUS },
      { status },
    );
    await shortlistProjectCommentModel.update(
      {
        shortlisted_project_fk,
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
      { where: { shortlisted_project_comment_id }, transaction },
    );
    return shortlisted_project_comment_id;
  };

  /**
   * Find all active shortlisted project comment records given id
   * @param {{
   *  shortlisted_project_comment_id?: string,
   * 	shortlisted_project_fk?: string,
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
  shortlistProjectCommentController.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery = false } = {},
  ) => {
    const funcName = 'shortlistProjectCommentController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await shortlistProjectCommentModel.findAll({
      where: {
        ...where,
        status: constant.SHORTLIST_PROJECT.COMMENT.STATUS.ACTIVE,
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
   * Count all active shortlisted project comment records given id
   * @param {{
   *  shortlisted_project_comment_id?: string,
   * 	shortlisted_project_fk?: string,
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
  shortlistProjectCommentController.count = async (
    where,
    { include, transaction, subQuery } = {},
  ) => {
    const funcName = 'shortlistProjectCommentController.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await shortlistProjectCommentModel.count({
      where: {
        ...where,
        status: constant.SHORTLIST_PROJECT.COMMENT.STATUS.ACTIVE,
      },
      distinct: true,
      transaction,
      include,
      subQuery,
    });
    return h.database.formatData(records);
  };

  /**
   * Find an active shortlisted project comment record given id
   * @param {{
   *  shortlisted_project_comment_id?: string,
   * 	shortlisted_project_fk?: string,
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
  shortlistProjectCommentController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'shortlistProjectCommentController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await shortlistProjectCommentModel.findOne({
      where: {
        ...where,
        status: constant.SHORTLIST_PROJECT.COMMENT.STATUS.ACTIVE,
      },
      transaction,
      include,
    });
    return h.database.formatData(record);
  };

  /**
   * Soft delete shortlisted project comment record
   * @param {{
   * 	shortlisted_project_fk?: string,
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
  shortlistProjectCommentController.delete = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistProjectCommentController.delete';
    h.validation.requiredParams(funcName, { where });
    const { shortlisted_project_comment_id } =
      await shortlistProjectCommentModel.findOne(where, { transaction });
    await shortlistProjectCommentModel.update(
      shortlisted_project_comment_id,
      { status: constant.SHORTLIST_PROJECT.COMMENT.STATUS.DELETED },
      { transaction },
    );
  };

  /**
   * Hard delete shortlisted project comment record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  shortlistProjectCommentController.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistProjectCommentController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await shortlistProjectCommentModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return shortlistProjectCommentController;
};
