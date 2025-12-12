const h = require('../helpers');

module.exports.makeController = (models) => {
  const { chaaat_product_matrix: model } = models;
  const ctr = {};

  /**
   * Description
   * Get all product matrix records based on conditions
   * @async
   * @constant
   * @name findAll
   * @param where condition data
   * @param order sorting data
   * @param include join data
   * @param transaction db transaction
   * @returns {Promise} returns all product matrix records based on conditions
   */
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
   * Description
   * Get single product matrix record based on conditions
   * @async
   * @constant
   * @name findOne
   * @param where condition data
   * @param include join data
   * @param transaction db transaction
   * @returns {Promise} returns single product matrix record based on conditions
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

  return ctr;
};
