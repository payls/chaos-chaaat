const h = require('../helpers');

module.exports.makeShortListedPropertyCommentReactionController = (models) => {
  const {
    shortlisted_property_comment_reaction:
      shortlistPropertyCommentReactionModel,
  } = models;
  const shortlistPropertyCommentReactionController = {};

  /**
   * Create shortlisted property comment reaction record
   * @param {{
   *  shortlisted_property_comment_fk?: string,
   *  contact_fk?: string,
   *  agency_user_fk?: string,
   *  emoji?: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortlistPropertyCommentReactionController.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistPropertyCommentReactionController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      shortlisted_property_comment_fk,
      contact_fk,
      agency_user_fk,
      emoji,
      created_by,
    } = record;
    const shortlisted_property_comment_reaction_id = h.general.generateId();
    await shortlistPropertyCommentReactionModel.create(
      {
        shortlisted_property_comment_reaction_id,
        shortlisted_property_comment_fk,
        contact_fk,
        agency_user_fk,
        emoji,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return shortlisted_property_comment_reaction_id;
  };

  /**
   * Update shortlisted property comment reaction record
   * @param {{
   *  shortlisted_property_comment_fk?: string,
   *  contact_fk?: string,
   *  agency_user_fk?: string,
   *  emoji?: string,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortlistPropertyCommentReactionController.update = async (
    shortlisted_property_comment_reaction_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistPropertyCommentReactionController.update';
    h.validation.requiredParams(funcName, {
      shortlisted_property_comment_reaction_id,
      record,
    });
    const {
      shortlisted_property_comment_fk,
      contact_fk,
      agency_user_fk,
      emoji,
      updated_by,
    } = record;
    await shortlistPropertyCommentReactionModel.update(
      {
        shortlisted_property_comment_fk,
        contact_fk,
        agency_user_fk,
        emoji,
        updated_by,
      },
      { where: { shortlisted_property_comment_reaction_id }, transaction },
    );
    return shortlisted_property_comment_reaction_id;
  };

  /**
   * Find all short listed property comment reaction records
   * @param {{
   *  shortlisted_property_comment_reaction_id?: string,
   * 	shortlisted_property_comment_fk?: string,
   *  contact_fk?: string,
   *  agency_user_fk?: number,
   *  emoji?: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  shortlistPropertyCommentReactionController.findAll = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistPropertyCommentReactionController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await shortlistPropertyCommentReactionModel.findAll({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Find single short listed property comment reaction record
   * @param {{
   *  shortlisted_property_comment_reaction_id?: string,
   * 	shortlisted_property_comment_fk?: string,
   *  contact_fk?: string,
   *  agency_user_fk?: number,
   *  emoji?: string,
   *	created_by?: string,
   *  updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  shortlistPropertyCommentReactionController.findOne = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistPropertyCommentReactionController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await shortlistPropertyCommentReactionModel.findOne({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Hard delete shortlisted property comment reaction record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  shortlistPropertyCommentReactionController.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistPropertyCommentReactionController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await shortlistPropertyCommentReactionModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return shortlistPropertyCommentReactionController;
};
