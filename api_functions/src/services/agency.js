const MainService = require('./main');
class AgencyService extends MainService {
  constructor() {
    super();
  }

  /**
   * Description
   * Service to search for agency record
   * @async
   * @method
   * @name findOne
   * @kind method
   * @memberof AgencyService
   * @param {any} response
   * @returns {Promise<any>}
   */
  async findOne(where, { include, order, attributes, subQuery } = {}) {
    try {
      const record = await this.models.agency.findOne({
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
   * Service to create an agency record
   * @async
   * @method
   * @name createAgency
   * @kind method
   * @memberof AgencyService
   * @param {any} record
   * @param {{ transaction: any }} { transaction }
   * @returns {Promise<string>} returns the agency ID
   */
  async createAgency(record, { transaction }) {
    try {
      const agency_id = this.helper.generateId();
      await this.models.agency.create(
        {
          agency_id,
          ...record,
        },
        { transaction },
      );
      return agency_id;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Description
   * Service to update an agency record
   * @async
   * @method
   * @name updateAgency
   * @kind method
   * @memberof AgencyService
   * @param {any} where
   * @param {any} record
   * @param {{ transaction: any }} { transaction }
   * @returns {Promise<void>}
   */
  async updateAgency(where, record, { transaction }) {
    try {
      await this.models.agency.update(
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
   * Service to check if agency is a stripe customer by checking if there is
   * a stripe customer ID linked to the agency
   * @async
   * @method
   * @name isAgencyAStripeCustomer
   * @kind method
   * @memberof AgencyService
   * @param {any} agency_id
   * @returns {Promise<boolean, string>}
   */
  async isAgencyAStripeCustomer(agency_id) {
    const { stripe_customer_id } = await this.findOne({ agency_id }, {});
    const is_stripe_customer = this.helper.notEmpty(stripe_customer_id);

    return { is_stripe_customer, customer_id: stripe_customer_id };
  }
}

module.exports = AgencyService;
