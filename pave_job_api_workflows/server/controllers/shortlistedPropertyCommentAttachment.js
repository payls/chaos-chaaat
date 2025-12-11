const h = require('../helpers');

module.exports.makeShortListedPropertyCommentAttachmentController = (
  models,
) => {
  const {
    shortlisted_property_comment_attachment:
      shortlistPropertyCommentAttachmentModel,
  } = models;
  const shortlistPropertyCommentAttachmentController = {};

  /**
   * Create shortlisted property comment attachment record
   * @param {{
   *  shortlisted_property_comment_fk?: string,
   *  attachment_url?: string,
   *  attachment_title?: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortlistPropertyCommentAttachmentController.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistPropertyCommentAttachmentController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      shortlisted_property_comment_fk,
      attachment_url,
      attachment_title,
      file_name,
      created_by,
    } = record;
    const shortlisted_property_comment_attachment_id = h.general.generateId();

    // Prevent duplicate naming for file names
    let guard = 0;
    let count = 1;
    let currentFileName = file_name;
    if (h.isEmpty(file_name))
      throw new Error(`${funcName}: file_name cannot be empty`);
    const splitedFileName = file_name.split('.');
    if (splitedFileName.length <= 1)
      throw new Error(`${funcName}: file_name must be in format {name}.{ext}`);
    while (guard === 0) {
      const attachment = await shortlistPropertyCommentAttachmentModel.findOne({
        where: {
          file_name: currentFileName,
        },
      });

      if (h.isEmpty(attachment)) {
        guard = 1;
        break;
      }
      count++;
      currentFileName =
        splitedFileName[0] + ' ' + count + '.' + splitedFileName[1];
    }

    await shortlistPropertyCommentAttachmentModel.create(
      {
        shortlisted_property_comment_attachment_id,
        shortlisted_property_comment_fk,
        attachment_url,
        attachment_title,
        file_name: currentFileName,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return shortlisted_property_comment_attachment_id;
  };

  /**
   * Update shortlisted property comment attachment record
   * @param {string} shortlisted_property_comment_attachment_id
   * @param {{
   * 	shortlisted_property_comment_fk?: string,
   *  attachment_url?: string,
   *  attachment_title?: string,
   *	updated_by?: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortlistPropertyCommentAttachmentController.update = async (
    shortlisted_property_comment_attachment_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistPropertyCommentAttachmentController.update';
    h.validation.requiredParams(funcName, {
      shortlisted_property_comment_attachment_id,
      record,
    });
    const {
      shortlisted_property_comment_fk,
      attachment_url,
      attachment_title,
      updated_by,
    } = record;
    await shortlistPropertyCommentAttachmentModel.update(
      {
        shortlisted_property_comment_fk,
        attachment_url,
        attachment_title,
        updated_by,
      },
      { where: { shortlisted_property_comment_attachment_id }, transaction },
    );
    return shortlisted_property_comment_attachment_id;
  };

  /**
   * Find all active shortlisted property comment attachment records given id
   * @param {{
   *  shortlisted_property_comment_attachment_id?: string,
   * 	shortlisted_property_comment_fk?: string,
   *  attachment_url?: string,
   *  attachment_title?: string,
   *	created_by?: string,
   *	updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  shortlistPropertyCommentAttachmentController.findAll = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'shortlistPropertyCommentAttachmentController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await shortlistPropertyCommentAttachmentModel.findAll({
      where: { ...where },
      transaction,
      include,
    });
    return h.database.formatData(records);
  };

  /**
   * Find an active shortlisted property comment attachment record given id
   * @param {{
   *  shortlisted_property_comment_attachment_id?: string,
   * 	shortlisted_property_comment_fk?: string,
   *  attachment_url?: string,
   *  attachment_title?: string,
   *	created_by?: string,
   *	updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  shortlistPropertyCommentAttachmentController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'shortlistPropertyCommentAttachmentController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await shortlistPropertyCommentAttachmentModel.findOne({
      where: { ...where },
      transaction,
      include,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete shortlisted property comment attachment record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  shortlistPropertyCommentAttachmentController.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistPropertyCommentAttachmentController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await shortlistPropertyCommentAttachmentModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return shortlistPropertyCommentAttachmentController;
};
