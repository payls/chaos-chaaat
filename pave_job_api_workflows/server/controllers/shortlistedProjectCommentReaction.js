const h = require('../helpers');

module.exports.makeShortListedProjectCommentReactionController = (models) => {
  const {
    shortlisted_project_comment_reaction: shortlistProjectCommentReactionModel,
  } = models;
  const shortlistProjectCommentReactionController = {};

  /**
   * Create shortlisted project comment reaction record
   * @param {{
   *  shortlisted_project_comment_fk?: string,
   *  contact_fk?: string,
   *  agency_user_fk?: string,
   *  emoji?: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortlistProjectCommentReactionController.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistProjectCommentReactionController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      shortlisted_project_comment_fk,
      contact_fk,
      agency_user_fk,
      emoji,
      created_by,
    } = record;
    const shortlisted_project_comment_reaction_id = h.general.generateId();
    await shortlistProjectCommentReactionModel.create(
      {
        shortlisted_project_comment_reaction_id,
        shortlisted_project_comment_fk,
        contact_fk,
        agency_user_fk,
        emoji,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return shortlisted_project_comment_reaction_id;
  };

  /**
   * Update shortlisted project comment reaction record
   * @param {{
   *  shortlisted_project_comment_fk?: string,
   *  contact_fk?: string,
   *  agency_user_fk?: string,
   *  emoji?: string,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortlistProjectCommentReactionController.update = async (
    shortlisted_project_comment_reaction_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistProjectCommentReactionController.update';
    h.validation.requiredParams(funcName, {
      shortlisted_project_comment_reaction_id,
      record,
    });
    const {
      shortlisted_project_comment_fk,
      contact_fk,
      agency_user_fk,
      emoji,
      updated_by,
    } = record;
    await shortlistProjectCommentReactionModel.update(
      {
        shortlisted_project_comment_fk,
        contact_fk,
        agency_user_fk,
        emoji,
        updated_by,
      },
      { where: { shortlisted_project_comment_reaction_id }, transaction },
    );
    return shortlisted_project_comment_reaction_id;
  };

  /**
   * Find all short listed project comment reaction records
   * @param {{
   *  shortlisted_project_comment_reaction_id?: string,
   * 	shortlisted_project_comment_fk?: string,
   *  contact_fk?: string,
   *  agency_user_fk?: number,
   *  emoji?: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  shortlistProjectCommentReactionController.findAll = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistProjectCommentReactionController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await shortlistProjectCommentReactionModel.findAll({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Find single short listed project comment reaction record
   * @param {{
   *  shortlisted_project_comment_reaction_id?: string,
   * 	shortlisted_project_comment_fk?: string,
   *  contact_fk?: string,
   *  agency_user_fk?: number,
   *  emoji?: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  shortlistProjectCommentReactionController.findOne = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistProjectCommentReactionController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await shortlistProjectCommentReactionModel.findOne({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Hard delete shortlisted project comment reaction record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  shortlistProjectCommentReactionController.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistProjectCommentReactionController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await shortlistProjectCommentReactionModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return shortlistProjectCommentReactionController;
};
