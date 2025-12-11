const h = require('../helpers');
const sequelize = require('sequelize');

module.exports.makeController = (models) => {
  const { stripe_invoice: stripeInvoiceModel } = models;

  const stripeInvoiceCtl = {};

  stripeInvoiceCtl.create = async (record, { transaction } = {}) => {
    const funcName = 'stripeInvoiceCtl.create';
    h.validation.requiredParams(funcName, { record });
    const { stripe_invoice_id, status, payload } = record;
    const record_stripe_invoice_id =
      stripe_invoice_id || h.general.generateId();
    await stripeInvoiceModel.create(
      {
        stripe_invoice_id: record_stripe_invoice_id,
        status,
        payload,
      },
      { transaction },
    );

    return record_stripe_invoice_id;
  };

  stripeInvoiceCtl.update = async (
    stripe_invoice_id,
    record,
    { transaction } = {},
  ) => {
    const funcName = 'stripeInvoiceCtl.update';
    h.validation.requiredParams(funcName, { record });
    const { agency_fk, status, payload } = record;

    await stripeInvoiceModel.update(
      {
        agency_fk,
        status,
        payload,
      },
      {
        where: { stripe_invoice_id },
        transaction,
      },
    );

    return stripe_invoice_id;
  };

  stripeInvoiceCtl.findAll = async (
    where,
    { order, include, transaction, offset, limit, subQuery, group } = {},
  ) => {
    const funcName = 'stripeInvoiceCtl.findAll';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await stripeInvoiceModel.findAll({
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

  stripeInvoiceCtl.findOne = async (
    where,
    { order, include, transaction, offset, limit, subQuery } = {},
  ) => {
    const funcName = 'stripeInvoiceCtl.findOne';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await stripeInvoiceModel.findOne({
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
  stripeInvoiceCtl.destroy = async (where, { transaction } = {}) => {
    const funcName = 'stripeInvoiceCtl.destroy';
    h.validation.requiredParams(funcName, { where });
    const record = await stripeInvoiceModel.findOne({
      where: { ...where },
      transaction,
    });
    if (record) await record.destroy({ transaction });
  };

  stripeInvoiceCtl.count = async (
    where,
    { include, transaction, subQuery, order, group } = {},
  ) => {
    const funcName = 'stripeInvoiceCtl.count';
    h.validation.requiredParams(funcName, { where });
    h.validation.isObjectOrArray(funcName, { where });
    const records = await stripeInvoiceModel.count({
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

  return stripeInvoiceCtl;
};
