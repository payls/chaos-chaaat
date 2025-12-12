const h = require('../helpers');
const sequelize = require('sequelize');

module.exports.makeController = (models) => {
  const { stripe_payment_intent: stripePaymentIntentModel } = models;

  const stripePaymentIntentCtl = {};

  stripePaymentIntentCtl.create = async (record, { transaction } = {}) => {
    const funcName = 'stripePaymentIntentCtl.create';
    h.validation.requiredParams(funcName, { record });
    const { stripe_payment_intent_id, status, payload } = record;
    const record_stripe_payment_intent_id =
      stripe_payment_intent_id || h.general.generateId();
    await stripePaymentIntentModel.create(
      {
        stripe_payment_intent_id: record_stripe_payment_intent_id,
        status,
        payload,
      },
      { transaction },
    );

    return record_stripe_payment_intent_id;
  };

  stripePaymentIntentCtl.update = async (
    stripe_payment_intent_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'stripePaymentIntentCtl.update';
    h.validation.requiredParams(funcName, { record });
    const { agency_fk, status, payload } = record;

    await stripePaymentIntentModel.update(
      {
        agency_fk,
        status,
        payload,
      },
      {
        where: { stripe_payment_intent_id },
        transaction,
      },
    );

    return stripe_payment_intent_id;
  };

  stripePaymentIntentCtl.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery, group } = {},
  ) => {
    const funcName = 'stripePaymentIntentCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await stripePaymentIntentModel.findAll({
      where: { ...where },
      offset,
      limit,
      subQuery,
      include,
      transaction,
      order,
      group,
    });
    return h.database.formatData(records);
  };

  stripePaymentIntentCtl.findOne = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'stripePaymentIntentCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await stripePaymentIntentModel.findOne({
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
   * Hard delete whatsapp_message_tracker record
   * @param {object} where
   * @param {{ transaction?:object }} [options]
   * @returns {Promise<void>}
   */
  stripePaymentIntentCtl.destroy = async (where, { transaction } = {}) => {
    const funcName = 'stripePaymentIntentCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await stripePaymentIntentModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  stripePaymentIntentCtl.count = async (
    where,
    { include, transaction, subQuery, order, group } = {},
  ) => {
    const funcName = 'stripePaymentIntentCtl.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await stripePaymentIntentModel.count({
      where: { ...where },
      subQuery,
      include,
      transaction,
      order,
      group,
      raw: true,
    });
    return h.database.formatData(records);
  };

  return stripePaymentIntentCtl;
};
