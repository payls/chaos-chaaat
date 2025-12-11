const MainService = require('./main');
class InventoryService extends MainService {
  constructor() {
    super();
  }

  /**
   * Description
   * Service function to create an inventory record
   * @async
   * @method
   * @name createInventory
   * @kind method
   * @memberof InventoryService
   * @param {any} record
   * @param {{ transaction: any }} { transaction }
   * @returns {Promise<string>}
   */
  async createInventory(record, { transaction }) {
    try {
      const inventory_id = this.helper.generateId();
      await this.models.inventory.create(
        {
          inventory_id,
          ...record,
        },
        { transaction },
      );
      return inventory_id;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Description
   * Find one inventory record based on filters
   * @async
   * @method
   * @name findOne
   * @kind method
   * @memberof InventoryService
   * @param {any} where
   * @param {object} { include, order, attributes, subQuery }?
   * @returns {Promise<any>}
   */
  async findOne(where, { include, order, attributes, subQuery } = {}) {
    try {
      const record = await this.models.inventory.findOne({
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
}
module.exports = InventoryService;
