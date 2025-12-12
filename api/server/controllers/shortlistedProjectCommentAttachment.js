const h = require('../helpers');

module.exports.makeShortListedProjectCommentAttachmentController = (models) => {
  const {
    shortlisted_project_comment_attachment:
      shortlistProjectCommentAttachmentModel,
  } = models;
  const shortlistProjectCommentAttachmentController = {};

  /**
   * Create shortlisted project comment attachment record
   * @param {{
   *  shortlisted_project_comment_fk?: string,
   *  attachment_url?: string,
   *  attachment_title?: string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortlistProjectCommentAttachmentController.create = async (
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistProjectCommentAttachmentController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      shortlisted_project_comment_fk,
      attachment_url,
      attachment_title,
      file_name,
      created_by,
    } = record;
    const shortlisted_project_comment_attachment_id = h.general.generateId();

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
      const attachment = await shortlistProjectCommentAttachmentModel.findOne({
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

    await shortlistProjectCommentAttachmentModel.create(
      {
        shortlisted_project_comment_attachment_id,
        shortlisted_project_comment_fk,
        attachment_url,
        attachment_title,
        file_name: currentFileName,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return shortlisted_project_comment_attachment_id;
  };

  /**
   * Update shortlisted project comment attachment record
   * @param {string} shortlisted_project_comment_attachment_id
   * @param {{
   * 	shortlisted_project_comment_fk?: string,
   *  attachment_url?: string,
   *  attachment_title?: string,
   *	updated_by?: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  shortlistProjectCommentAttachmentController.update = async (
    shortlisted_project_comment_attachment_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistProjectCommentAttachmentController.update';
    h.validation.requiredParams(funcName, {
      shortlisted_project_comment_attachment_id,
      record,
    });
    const {
      shortlisted_project_comment_fk,
      attachment_url,
      attachment_title,
      updated_by,
    } = record;
    await shortlistProjectCommentAttachmentModel.update(
      {
        shortlisted_project_comment_fk,
        attachment_url,
        attachment_title,
        updated_by,
      },
      { where: { shortlisted_project_comment_attachment_id }, transaction },
    );
    return shortlisted_project_comment_attachment_id;
  };

  /**
   * Find all active shortlisted project comment attachment records given id
   * @param {{
   *  shortlisted_project_comment_attachment_id?: string,
   * 	shortlisted_project_comment_fk?: string,
   *  attachment_url?: string,
   *  attachment_title?: string,
   *	created_by?: string,
   *	updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  shortlistProjectCommentAttachmentController.findAll = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'shortlistProjectCommentAttachmentController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await shortlistProjectCommentAttachmentModel.findAll({
      where: { ...where },
      transaction,
      include,
    });
    return h.database.formatData(records);
  };

  /**
   * Find an active shortlisted project comment attachment record given id
   * @param {{
   *  shortlisted_project_comment_attachment_id?: string,
   * 	shortlisted_project_comment_fk?: string,
   *  attachment_url?: string,
   *  attachment_title?: string,
   *	created_by?: string,
   *	updated_by?: string
   * }} where
   * @param {{ include?:Array, transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  shortlistProjectCommentAttachmentController.findOne = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'shortlistProjectCommentAttachmentController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await shortlistProjectCommentAttachmentModel.findOne({
      where: { ...where },
      transaction,
      include,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete shortlisted project comment attachment record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  shortlistProjectCommentAttachmentController.destroy = async (
    where,
    { transaction } = {},
  ) => {
    const funcName = 'shortlistProjectCommentAttachmentController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await shortlistProjectCommentAttachmentModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  return shortlistProjectCommentAttachmentController;
};
