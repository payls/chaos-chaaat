const constant = require('../constants/constant.json');
const h = require('../helpers');
const { Op } = require('sequelize');
const moment = require('moment');
const config = require('../configs/config')(process.env.NODE_ENV);
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
module.exports.makeController = (models) => {
  const { campaign_inventory: campaignInventoryModel } = models;
  const agency = require('./agency').makeAgencyController(models);
  const whatsAppChat = require('./whatsappChat').makeController(models);
  const agencyWhatsAppConfig = require('./agencyWhatsappConfig').makeController(
    models,
  );
  const agencySubscription = require('./agencySubscription').makeController(
    models,
  );
  const productMatrix = require('./chaaatProductMatrix').makeController(models);
  const user = require('./user').makeUserController(models);
  const subscriptionProductCtl =
    require('./agencySubscriptionProduct').makeController(models);
  const campaignInventoryController = {};

  /**
   * Create campaign_inventory record
   * @param {{
   * 	agency_fk:string,
   *	agency_subscription_fk:string,
   *  campaign_count:integer,
   *  period_from
   *  period_to
   *	created_by?:string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  campaignInventoryController.create = async (record, { transaction } = {}) => {
    const funcName = 'campaignInventoryController.create';
    console.log(record);
    const {
      agency_fk,
      agency_subscription_fk,
      period_from,
      period_to,
      campaign_count,
      created_by,
    } = record;
    h.validation.requiredParams(funcName, {
      agency_fk,
      agency_subscription_fk,
      period_from,
      period_to,
    });
    const campaign_inventory_id = h.general.generateId();
    await campaignInventoryModel.create(
      {
        campaign_inventory_id,
        agency_fk,
        agency_subscription_fk,
        period_from,
        period_to,
        campaign_count,
        created_by: created_by,
      },
      { transaction },
    );
    return campaign_inventory_id;
  };

  /**
   * Update campaign_inventory record by campaign_inventory_id
   * @param {string} campaign_inventory_id
   * @param {{
   * 	agency_fk:string,
   *  agency_subscription_fk: string,
   *  campaign_count:integer,
   *	updated_by?:string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  campaignInventoryController.update = async (
    campaign_inventory_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'campaignInventoryController.update';
    h.validation.requiredParams(funcName, { campaign_inventory_id, record });
    await campaignInventoryModel.update(record, {
      where: { campaign_inventory_id },
      transaction,
    });
    return campaign_inventory_id;
  };

  /**
   * Find one campaign_inventory record
   * @param where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object|Array>}
   */
  campaignInventoryController.findOne = async (where, { transaction } = {}) => {
    const funcName = 'campaignInventoryController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await campaignInventoryModel.findOne({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete campaign_inventory record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  campaignInventoryController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'campaignInventoryController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await campaignInventoryModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Count campaign_inventory record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  campaignInventoryController.count = async (
    where,
    { include, transaction } = {},
  ) => {
    const funcName = 'campaignInventoryModel.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await campaignInventoryModel.count({
      where: { ...where },
      distinct: true,
      include,
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Function to add campaign count in agency campaign inventory
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  campaignInventoryController.addCampaignCount = async (agency_id) => {
    const subscription = await agencySubscription.findOne(
      {
        agency_fk: agency_id,
        status: 'active',
      },
      { order: [['created_date', 'DESC']] },
    );
    const inventory = await campaignInventoryController.findOne({
      agency_fk: agency_id,
      agency_subscription_fk: subscription?.agency_subscription_id,
    });
    const transaction = await models.sequelize.transaction();
    try {
      if (h.notEmpty(inventory)) {
        await campaignInventoryModel.increment(
          {
            campaign_count: 1,
          },
          {
            where: {
              agency_fk: agency_id,
              agency_subscription_fk: subscription?.agency_subscription_id,
            },
            transaction,
          },
        );
      } else {
        const campaign_inventory_id = h.general.generateId();
        await campaignInventoryModel.create(
          {
            campaign_inventory_id,
            agency_fk: agency_id,
            agency_subscription_fk: subscription?.agency_subscription_id,
            period_from: subscription?.subscription_start,
            period_to: subscription?.subscription_end,
          },
          { transaction },
        );
      }
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  };

  return campaignInventoryController;
};
