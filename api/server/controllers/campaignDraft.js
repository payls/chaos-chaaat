const h = require('../helpers');

module.exports.makeController = (models) => {
  const { campaign_draft: campaignDraftModel } = models;

  const campaignDraft = {};

  /**
   * Create campaign_draft record
   * @param {{
   * agency_fk: string,
   * configuration: text,
   * platform: string,
   * status: string,
   * created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  campaignDraft.create = async (record, { transaction } = {}) => {
    const funcName = 'campaignDraft.create';
    h.validation.requiredParams(funcName, { record });
    const { agency_fk, configuration, platform, status, created_by } = record;
    const campaign_draft_id = h.general.generateId();
    await campaignDraftModel.create(
      {
        campaign_draft_id,
        agency_fk,
        configuration,
        platform,
        status,
        created_by,
      },
      { transaction },
    );

    return campaign_draft_id;
  };
  /**
   * Update campaign_draft record
   * @param {string} campaign_draft_id
   * @param {{
   * campaign_draft_id: string,
   * agency_fk: string,
   * configuration: text,
   * platform: string,
   * status: string,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  campaignDraft.update = async (
    campaign_draft_id,
    record,
    updated_by,
    { transaction } = {},
  ) => {
    const funcName = 'campaignDraft.update';
    h.validation.requiredParams(funcName, { record });
    const { agency_fk, configuration, platform, status } = record;

    await campaignDraftModel.update(
      {
        campaign_draft_id,
        agency_fk,
        configuration,
        platform,
        status,
        updated_by,
      },
      {
        where: { campaign_draft_id },
        transaction,
      },
    );

    return campaign_draft_id;
  };

  /**
   * Find all campaign_draft records
   * @param {{
   * campaign_draft_id: string,
   * agency_fk: string,
   * configuration: string,
   * platform: string,
   * status: string,
   * updated_by: string,
   * created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  campaignDraft.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'campaignDraft.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await campaignDraftModel.findAll({
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
   * Find one campaign_draft records
   * @param {{
   * campaign_draft_id: string,
   * agency_fk: string,
   * configuration: text,
   * platform,
   * status: string,
   * updated_by: string,
   * created_by: string,
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  campaignDraft.findOne = async (where, { include, transaction } = {}) => {
    const funcName = 'campaignDraft.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await campaignDraftModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete campaign_draft record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  campaignDraft.destroy = async (where, { transaction } = {}) => {
    const funcName = 'campaignDraft.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await campaignDraftModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Count campaign_draft record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  campaignDraft.count = async (where, { include, transaction } = {}) => {
    const funcName = 'campaignDraft.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await campaignDraftModel.count({
      where: { ...where },
      distinct: true,
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Description
   * Function to mark campaign draft as processed
   * @async
   * @constant
   * @name markDraftAsProcessed
   * @param {string} campaign_draft_id
   * @param {string} user_id
   */
  campaignDraft.markDraftAsProcessed = async (campaign_draft_id, user_id) => {
    const transaction = await models.sequelize.transaction();
    try {
      await campaignDraft.update(
        campaign_draft_id,
        {
          status: 'processed',
        },
        user_id,
        { transaction },
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw new Error(err);
    }
  };

  return campaignDraft;
};
