const h = require('../helpers');

module.exports.makeAgencyController = (models) => {
  const { agency: agencyModel } = models;
  const agencyUserController =
    require('./agencyUser').makeAgencyUserController(models);

  const agencyController = {};

  /**
   * Create agency record
   * @param {{
   * 	agency_name: string,
   * 	agency_logo_url?: string,
   * 	agency_size?: string,
   * 	agency_type?: string,
   * 	agency_website?: string,
   * 	agency_subscription_fk? :string,
   * 	agency_logo_whitebg_url?: string,
   * 	agency_subdomain?: string,
   * 	hubspot_id? :string,
   *	created_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  agencyController.create = async (record, { transaction } = {}) => {
    const funcName = 'agencyController.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_name,
      agency_logo_url,
      agency_size,
      agency_type,
      agency_website,
      agency_subscription_fk,
      agency_logo_whitebg_url,
      agency_subdomain,
      hubspot_id,
      created_by,
    } = record;
    const agency_id = h.general.generateId();
    await agencyModel.create(
      {
        agency_id,
        agency_name,
        agency_logo_url,
        agency_size,
        agency_type,
        agency_website,
        agency_subscription_fk,
        agency_logo_whitebg_url,
        agency_subdomain,
        hubspot_id,
        created_by,
        updated_by: created_by,
      },
      { transaction },
    );
    return agency_id;
  };

  /**
   * Update agency record
   * @param {string} agency_id
   * @param {{
   * 	agency_name: string,
   * 	agency_logo_url?: string,
   * 	agency_size?: string,
   * 	agency_type?: string,
   * 	agency_website?: string,
   * 	agency_subscription_fk? :string,
   * 	agency_logo_whitebg_url?: string,
   * 	agency_subdomain?: string,
   *  agency_whatsapp_api_token?: string,
   *  agency_whatsapp_api_secret?: string,
   *  agency_waba_id?: string,
   *  agency_waba_template_token?: string,
   *  agency_waba_template_secret?: string,
   * 	hubspot_id? :string,
   *	updated_by: string
   * }} record
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<string>}
   */
  agencyController.update = async (agency_id, record, { transaction } = {}) => {
    const funcName = 'agencyController.update';
    h.validation.requiredParams(funcName, { agency_id, record });
    const {
      agency_name,
      agency_logo_url,
      agency_size,
      agency_type,
      agency_website,
      agency_subscription_fk,
      agency_logo_whitebg_url,
      agency_subdomain,
      agency_whatsapp_api_token,
      agency_whatsapp_api_secret,
      agency_waba_id,
      agency_waba_template_token,
      agency_waba_template_secret,
      hubspot_id,
      updated_by,
    } = record;
    await agencyModel.update(
      {
        agency_name,
        agency_logo_url,
        agency_size,
        agency_type,
        agency_website,
        agency_subscription_fk,
        agency_logo_whitebg_url,
        agency_subdomain,
        agency_whatsapp_api_token,
        agency_whatsapp_api_secret,
        agency_waba_id,
        agency_waba_template_token,
        agency_waba_template_secret,
        hubspot_id,
        updated_by,
      },
      { where: { agency_id }, transaction },
    );
    return agency_id;
  };

  /**
   * Find all agency records
   * @param {{
   *  agency_id?: string,
   * 	agency_name?: string,
   * 	agency_logo_url?: string,
   * 	agency_size?: string,
   * 	agency_type?: string,
   * 	agency_website?: string,
   * 	agency_subscription_fk? :string,
   * 	agency_logo_whitebg_url?: string,
   * 	agency_subdomain?: string,
   * 	hubspot_id? :string,
   *	created_by?: string,
   *  updated_by?: string,
   * agency_whatsapp_api_token?: string,
   * agency_whatsapp_api_secret?: string
   * }} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Array>}
   */
  agencyController.findAll = async (where, { transaction } = {}) => {
    const funcName = 'agencyController.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await agencyModel.findAll({
      where: { ...where },
      transaction,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one agency record
   * @param {{
   *  agency_id?: string,
   * 	agency_name?: string,
   * 	agency_logo_url?: string,
   * 	agency_size?: string,
   * 	agency_type?: string,
   * 	agency_website?: string,
   * 	agency_subscription_fk? :string,
   * 	agency_logo_whitebg_url?: string,
   * 	agency_subdomain?: string,
   * 	hubspot_id? :string,
   *	created_by?: string,
   *  updated_by?: string,
   * agency_whatsapp_api_token?: string,
   * agency_whatsapp_api_secret?: string
   * }} where
   * @param {{ include?:array, transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  agencyController.findOne = async (where, { include, transaction } = {}) => {
    const funcName = 'agencyController.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await agencyModel.findOne({
      where: { ...where },
      include,
      transaction,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete task record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  agencyController.destroy = async (where, { transaction } = {}) => {
    const funcName = 'agencyController.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await agencyModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Check if a user has registered agency
   * @param user_id
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<>}
   */
  agencyController.getAgencyNameByUserId = async (
    user_id,
    { transaction } = {},
  ) => {
    const funcName = 'agencyController.getAgencyNameByUserId';
    h.validation.requiredParams(funcName, { user_id });
    const agency_user = await agencyUserController.findOne(
      { user_fk: user_id },
      { transaction },
    );
    let agency_name = null;
    if (!h.isEmpty(agency_user)) {
      const agency = await agencyController.findOne(
        { agency_id: agency_user.agency_fk },
        { transaction },
      );
      if (!h.isEmpty(agency)) agency_name = agency.agency_name;
    }
    return agency_name;
  };

  /**
   * Description
   * Get the current agency subscription product name
   * @async
   * @function
   * @name getCurrentSubscription
   * @kind function
   * @param {string} agency_id agency id
   * @returns {Promise} returns the current subscription product name
   */
  agencyController.getCurrentSubscription = async (agency_id) => {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const agencySubscription = require('./agencySubscription').makeController(
      models,
    );
    const agencySubscriptionProduct =
      require('./agencySubscriptionProduct').makeController(models);
    const subscriptionData = await agencySubscription.findOne(
      {
        agency_fk: agency_id,
        status: 'active',
      },
      { order: [['created_date', 'DESC']] },
    );

    let subscription_product_name = null;
    if (subscriptionData) {
      // get subscription main product
      const subscriptionProducts = await agencySubscriptionProduct.findAll({
        agency_subscription_fk: subscriptionData?.agency_subscription_id,
      });
      for (const product of subscriptionProducts) {
        const stripeProduct = await stripe.products.retrieve(
          product.stripe_product_id,
        );
        if (h.cmpStr(stripeProduct?.metadata?.product_type, 'package')) {
          subscription_product_name = stripeProduct?.metadata?.tier;
          break;
        }
      }
    }

    return subscription_product_name;
  };

  return agencyController;
};
