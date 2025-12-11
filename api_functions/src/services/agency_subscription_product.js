const MainService = require('./main');
class AgencySubscriptionProductService extends MainService {
  constructor() {
    super();
  }

  /**
   * Description
   * Service function to find one agency subscription product record based on given criteria
   * @async
   * @method
   * @name findOne
   * @kind method
   * @memberof AgencySubscriptionProductService
   * @param {any} where
   * @param {{ include: any attributes: any subQuery: any }} { include, attributes, subQuery }
   * @returns {Promise<any>}
   */
  async findOne(where, { include, attributes, subQuery } = {}) {
    try {
      const record = await this.models.agency_subscription_product.findOne({
        where: { ...where },
        include,
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
   * Service function to find all agency subscription product records based on given criteria
   * @async
   * @method
   * @name findAll
   * @kind method
   * @memberof AgencySubscriptionProductService
   * @param {any} where
   * @param {{ include: any attributes: any order: any limit: any offset: any subQuery: any }} { include, attributes, order, limit, offset, subQuery }
   * @returns {Promise<any>}
   */
  async findAll(
    where,
    { include, attributes, order, limit, offset, subQuery } = {},
  ) {
    try {
      const records = await this.models.agency_subscription_product.findAll({
        where: { ...where },
        include,
        attributes,
        order,
        limit,
        subQuery,
        offset,
      });
      return this.helper.database.formatData(records);
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Description
   * Service function to create an agency subscription product record
   * @async
   * @method
   * @name createAgencySubscriptionProduct
   * @kind method
   * @memberof AgencySubscriptionProductService
   * @param {any} record
   * @param {{ transaction: any }} { transaction }
   * @returns {Promise<string>}
   */
  async createAgencySubscriptionProduct(record, { transaction }) {
    try {
      const agency_subscription_product_id = this.helper.generateId();
      await this.models.agency_subscription_product.create(
        {
          agency_subscription_product_id,
          ...record,
        },
        { transaction },
      );
      return agency_subscription_product_id;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Description
   * Service function to update an agency subscription product record
   * @async
   * @method
   * @name updateAgencySubscriptionProduct
   * @kind method
   * @memberof AgencySubscriptionProductService
   * @param {any} where
   * @param {any} record
   * @param {{ transaction: any }} { transaction }
   * @returns {Promise<void>}
   */
  async updateAgencySubscriptionProduct(where, record, { transaction }) {
    try {
      await this.models.agency_subscription_product.update(
        {
          ...record,
        },
        {
          where: { ...where },
          transaction,
        },
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Description
   * Service function for deleting an agency subscription product record
   * @async
   * @method
   * @name deleteAgencySubscriptionProduct
   * @kind method
   * @memberof AgencySubscriptionProductService
   * @param {any} where
   * @param {{ transaction: any }} { transaction }
   * @returns {Promise<void>}
   */
  async deleteAgencySubscriptionProduct(where, { transaction }) {
    try {
      await this.models.agency_subscription_product.destroy({
        where: { ...where },
        transaction,
      });
    } catch (error) {
      throw new Error(error);
    }
  }
}
module.exports = AgencySubscriptionProductService;
