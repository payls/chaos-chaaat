const h = require('../helpers');
const sequelize = require('sequelize');

module.exports.makeController = (models) => {
  const { stripe_checkout_session: stripeCheckoutSessionModel } = models;

  const stripeCheckoutSession = {};

  stripeCheckoutSession.create = async (record, { transaction } = {}) => {
    const funcName = 'stripeCheckoutSession.create';
    h.validation.requiredParams(funcName, { record });
    const {
      stripe_checkout_session_id,
      agency_fk,
      paid = true,
      payload,
    } = record;
    const record_stripe_checkout_session_id =
      stripe_checkout_session_id || h.general.generateId();
    await stripeCheckoutSessionModel.create(
      {
        stripe_checkout_session_id: record_stripe_checkout_session_id,
        agency_fk,
        paid,
        payload,
      },
      { transaction },
    );

    return record_stripe_checkout_session_id;
  };

  stripeCheckoutSession.update = async (
    stripe_checkout_session_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'stripeCheckoutSession.update';
    h.validation.requiredParams(funcName, { record });
    const { agency_fk, paid = false, payload } = record;

    await stripeCheckoutSessionModel.update(
      {
        agency_fk,
        paid,
        payload,
      },
      {
        where: { stripe_checkout_session_id },
        transaction,
      },
    );

    return stripe_checkout_session_id;
  };

  stripeCheckoutSession.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery, group } = {},
  ) => {
    const funcName = 'stripeCheckoutSession.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await stripeCheckoutSessionModel.findAll({
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

  stripeCheckoutSession.findOne = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'stripeCheckoutSession.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await stripeCheckoutSessionModel.findOne({
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
  stripeCheckoutSession.destroy = async (where, { transaction } = {}) => {
    const funcName = 'stripeCheckoutSession.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await stripeCheckoutSessionModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  stripeCheckoutSession.count = async (
    where,
    { include, transaction, subQuery, order, group } = {},
  ) => {
    const funcName = 'stripeCheckoutSession.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await stripeCheckoutSessionModel.count({
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

  return stripeCheckoutSession;
};
