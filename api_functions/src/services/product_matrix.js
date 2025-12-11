const MainService = require('./main');
class ProductMatrixService extends MainService {
  constructor() {
    super();
  }

  /**
   * Description
   * Service to search for product matrix record
   * @async
   * @method
   * @name findOne
   * @kind method
   * @memberof ProductMatrixService
   * @param {any} response
   * @returns {Promise<any>}
   */
  async findOne(where, { include, order, attributes, subQuery } = {}) {
    try {
      const record = await this.models.product_matrix.findOne({
        where: { ...where },
        include,
        order,
        attributes,
        subQuery,
      });
      return this.helper.database.formatData(record);
    } catch (error) {
      // Handle error case
      throw new Error(error);
    }
  }

  /**
   * Description
   * Service function to create a product matrix record
   * @async
   * @method
   * @name createProductMatrix
   * @kind method
   * @memberof ProductMatrixService
   * @param {any} record
   * @param {{ transaction: any }} { transaction }
   * @returns {Promise<string>}
   */
  async createProductMatrix(record, { transaction }) {
    try {
      const product_matrix_id = this.helper.generateId();
      await this.models.product_matrix.create(
        {
          product_matrix_id,
          ...record,
        },
        { transaction },
      );
      return product_matrix_id;
    } catch (error) {
      throw new Error(error);
    }
  }
}
module.exports = ProductMatrixService;
