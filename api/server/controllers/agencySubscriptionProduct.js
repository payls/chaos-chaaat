const h = require('../helpers');
const { Op } = require('sequelize');

module.exports.makeController = (models) => {
  const { agency_subscription_product: model } = models;
  const ctr = {};

  ctr.create = async (record, { transaction } = {}) => {
    const funcName = 'ctr.create';
    h.validation.requiredParams(funcName, { record });
    const {
      agency_subscription_fk,
      stripe_product_id,
      subscription_data,
      product_name,
      allowed_channels,
      allowed_users,
      allowed_contacts,
      allowed_campaigns,
      allowed_automations,
      allowed_outgoing_messages,
    } = record;
    const agency_subscription_product_id = h.general.generateId();
    await model.create(
      {
        agency_subscription_product_id,
        agency_subscription_fk,
        stripe_product_id,
        subscription_data,
        product_name,
        allowed_channels,
        allowed_users,
        allowed_contacts,
        allowed_campaigns,
        allowed_automations,
        allowed_outgoing_messages,
      },
      { transaction },
    );
    return agency_subscription_product_id;
  };

  ctr.update = async (
    agency_subscription_product_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'ctr.update';
    h.validation.requiredParams(funcName, {
      agency_subscription_product_id,
      record,
    });
    await model.update(record, {
      where: { agency_subscription_product_id },
      transaction,
    });
    return agency_subscription_product_id;
  };

  ctr.findAll = async (where, { order, include, transaction } = {}) => {
    const funcName = 'ctr.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await model.findAll({
      where: { ...where },
      transaction,
      include,
      order,
    });
    return h.database.formatData(records);
  };

  /**
   * Find one agency_subscription_product record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<Object>}
   */
  ctr.findOne = async (where, { transaction, include } = {}) => {
    const funcName = 'ctr.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const record = await model.findOne({
      where: { ...where },
      transaction,
      include,
    });
    return h.database.formatData(record);
  };

  /**
   * Hard delete
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  ctr.destroy = async (where, { transaction } = {}) => {
    const funcName = 'ctr.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await model.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  /**
   * Hard delete All
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  ctr.destroyAll = async (where, { transaction } = {}) => {
    const funcName = 'ctr.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await model.findAll({
      where: { ...where },
      transaction,
    });
    if (record) await model.destroy({ where: { ...where } }, { transaction });
  };

  /**
   * Description
   * Function to get what is included in the subscription
   * @function
   * @name getSubscriptionCredits
   * @kind function
   * @param {any} subscription
   * @returns {Promise<any>} returns the subsription credit details
   * subscription
   */
  ctr.getSubscriptionCredits = async (subscription) => {
    const credits = {
      allowed_channels: 0,
      allowed_users: 0,
      allowed_contacts: 0,
      allowed_campaigns: 0,
      allowed_automations: 0,
      allowed_outgoing_messages: 0,
    };
    const subscriptionProducts = await ctr.findAll({
      agency_subscription_fk: subscription?.agency_subscription_id,
      product_name: { [Op.ne]: 'contact' },
    });
    for (const product of subscriptionProducts) {
      // computing allowed channels
      credits.allowed_channels =
        h.cmpStr(product?.allowed_channels, 'unlimited') ||
        h.cmpStr(credits.allowed_channels, 'unlimited')
          ? 'unlimited'
          : h.isEmpty(product?.allowed_channels)
          ? parseInt(credits.allowed_channels)
          : parseInt(credits.allowed_channels) +
            parseInt(product?.allowed_channels);
      // computing allowed users
      credits.allowed_users =
        h.cmpStr(product?.allowed_users, 'unlimited') ||
        h.cmpStr(credits.allowed_users, 'unlimited')
          ? 'unlimited'
          : h.isEmpty(product?.allowed_users)
          ? parseInt(credits.allowed_users)
          : parseInt(credits.allowed_users) + parseInt(product?.allowed_users);
      // computing allowed contacts
      credits.allowed_contacts =
        h.cmpStr(product?.allowed_contacts, 'unlimited') ||
        h.cmpStr(credits.allowed_contacts, 'unlimited')
          ? 'unlimited'
          : h.isEmpty(product?.allowed_contacts)
          ? parseInt(credits.allowed_contacts)
          : parseInt(credits.allowed_contacts) +
            parseInt(product?.allowed_contacts);
      // computing allowed campaigns
      credits.allowed_campaigns =
        h.cmpStr(product?.allowed_campaigns, 'unlimited') ||
        h.cmpStr(credits.allowed_campaigns, 'unlimited')
          ? 'unlimited'
          : h.isEmpty(product?.allowed_campaigns)
          ? parseInt(credits.allowed_campaigns)
          : parseInt(credits.allowed_campaigns) +
            parseInt(product?.allowed_campaigns);
      // computing allowed automations
      credits.allowed_automations =
        h.cmpStr(product?.allowed_automations, 'unlimited') ||
        h.cmpStr(credits.allowed_automations, 'unlimited')
          ? 'unlimited'
          : h.isEmpty(product?.allowed_automations)
          ? parseInt(credits.allowed_automations)
          : parseInt(credits.allowed_automations) +
            parseInt(product?.allowed_automations);
      // computing allowed outgoing messages
      credits.allowed_outgoing_messages =
        h.cmpStr(product?.allowed_outgoing_messages, 'unlimited') ||
        h.cmpStr(credits.allowed_outgoing_messages, 'unlimited')
          ? 'unlimited'
          : h.isEmpty(product?.allowed_outgoing_messages)
          ? parseInt(credits.allowed_outgoing_messages)
          : parseInt(credits.allowed_outgoing_messages) +
            parseInt(product?.allowed_outgoing_messages);
    }

    // getting all contact products linked to the agency
    const contactProducts = await ctr.findAll(
      {
        product_name: 'contact',
      },
      {
        include: [
          {
            model: models.agency_subscription,
            where: { agency_fk: subscription?.agency_fk },
            required: true,
          },
        ],
      },
    );

    for (const product of contactProducts) {
      console.log(product);
      // computing allowed contacts
      credits.allowed_contacts =
        h.cmpStr(product?.allowed_contacts, 'unlimited') ||
        h.cmpStr(credits.allowed_contacts, 'unlimited')
          ? 'unlimited'
          : h.isEmpty(product?.allowed_contacts)
          ? parseInt(credits.allowed_contacts)
          : parseInt(credits.allowed_contacts) +
            parseInt(product?.allowed_contacts);
    }

    return credits;
  };

  return ctr;
};
