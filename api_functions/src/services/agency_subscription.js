const MainService = require('./main');
class AgencySubscriptionService extends MainService {
  constructor() {
    super();
  }

  /**
   * Description
   * Service function to find one agency subscription record based on given criteria
   * @async
   * @method
   * @name findOne
   * @kind method
   * @memberof AgencySubscriptionService
   * @param {any} where
   * @param {{ include: any attributes: any subQuery: any }} { include, attributes, subQuery }
   * @returns {Promise<any>}
   */
  async findOne(where, { include, order, attributes, subQuery } = {}) {
    try {
      const record = await this.models.agency_subscription.findOne({
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
   * Service function to find all agency subscription records based on given criteria
   * @async
   * @method
   * @name findAll
   * @kind method
   * @memberof AgencySubscriptionService
   * @param {any} where
   * @param {{ include: any attributes: any order: any limit: any offset: any subQuery: any }} { include, attributes, order, limit, offset, subQuery }
   * @returns {Promise<any>}
   */
  async findAll(
    where,
    { include, attributes, order, limit, offset, subQuery } = {},
  ) {
    try {
      const records = await this.models.agency_subscription.findAll({
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
   * Service function to create an agency subscription record
   * @async
   * @method
   * @name createAgencySubscription
   * @kind method
   * @memberof AgencySubscriptionService
   * @param {any} record
   * @param {{ transaction: any }} { transaction }
   * @returns {Promise<string>}
   */
  async createAgencySubscription(record, { transaction }) {
    try {
      const agency_subscription_id = this.helper.generateId();
      await this.models.agency_subscription.create(
        {
          agency_subscription_id,
          ...record,
        },
        { transaction },
      );
      return agency_subscription_id;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Description
   * Service function to update an agency subscription record
   * @async
   * @method
   * @name updateAgencySubscription
   * @kind method
   * @memberof AgencySubscriptionService
   * @param {any} where
   * @param {any} record
   * @param {{ transaction: any }} { transaction }
   * @returns {Promise<void>}
   */
  async updateAgencySubscription(where, record, { transaction }) {
    try {
      await this.models.agency_subscription.update(
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
}
module.exports = AgencySubscriptionService;
