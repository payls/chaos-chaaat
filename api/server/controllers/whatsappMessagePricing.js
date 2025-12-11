const h = require('../helpers');
const { Op } = require('sequelize');
const config = require('../configs/config')(process.env.NODE_ENV);
const constant = require('../constants/constant.json');
const sequelize = require('sequelize');

/**
 * Description
 * Controller for the whatsapp message pricing data
 * @var
 * @name module.exports.makeController
 * @param {object} models all available database table objects
 */
module.exports.makeController = (models) => {
  const { whatsapp_message_pricing: whatsappMessagePricingModel } = models;

  const whatsappMessagePricing = {};

  /**
   * Description
   * Function to get pricing matrix on a country using specific messaging type
   * and retrieving data on specific currency
   * @async
   * @constant
   * @name getTypeCountryCurrencyMatrix
   * @param {string} country
   * @param {string} type
   * @param {string} currency
   * @returns {Promise} object about the pricing data
   */
  whatsappMessagePricing.getTypeCountryCurrencyMatrix = async ({
    country,
    type,
    currency,
  }) => {
    const funcName = 'whatsappMessagePricing.getTypeCountryCurrencyMatrix';
    h.validation.requiredParams(funcName, { country });
    h.validation.requiredParams(funcName, { type });
    h.validation.requiredParams(funcName, { currency });
    const attributes = [
      'whatsapp_message_pricing_id',
      'market',
      'currency',
      type,
    ];
    const record = await whatsappMessagePricingModel.findOne({
      where: { market: country, currency },
      attributes,
    });

    return h.database.formatData(record);
  };

  return whatsappMessagePricing;
};
