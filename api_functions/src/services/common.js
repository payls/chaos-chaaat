const MainService = require('./main');
class CommonService extends MainService {
  constructor() {
    super();
  }

  /**
   * Description
   * Service to search for single record
   * @async
   * @method
   * @name findOne
   * @kind method
   * @memberof CommonService
   * @param {any} where
   * @param {object} { model, include, attributes, subQuery, order }?
   * @returns {Promise<any>}
   */
  async findOne(
    where,
    { model, include, attributes, subQuery = false, order } = {},
  ) {
    try {
      const record = await this.models[model].findOne({
        where: { ...where },
        include,
        attributes,
        subQuery,
        order,
      });
      return this.helper.database.formatData(record);
    } catch (error) {
      // Handle error case
      throw new Error(error);
    }
  }

  /**
   * Description
   * Service to find all records based on given conditions
   * @async
   * @method
   * @name findAll
   * @kind method
   * @memberof CommonService
   * @param {any} where
   * @param {{ include: any attributes: any order: any limit: any offset: any subQuery: any }}
   * { model, include, attributes, order, limit, offset, subQuery }
   * @returns {Promise<any>}
   */
  async findAll(
    where,
    {
      model,
      include,
      attributes,
      order,
      limit,
      offset,
      subQuery = false,
      group,
    },
  ) {
    try {
      const records = await this.models[model].findAll({
        where: { ...where },
        include,
        attributes,
        order,
        limit,
        subQuery,
        offset,
        group,
      });
      return records;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Description
   * Service function to find and count all results based on given conditions
   * This is mainly for listing with pagination
   * @async
   * @method
   * @name findAndCountAll
   * @kind method
   * @memberof CommonService
   * @param {any} where
   * @param {object} { model, include, attributes, order, limit, offset, subQuery }?
   * @returns {Promise<{ rows: any; count: any; }>}
   */
  async findAndCountAll(
    where,
    {
      model,
      include,
      attributes,
      order,
      limit,
      offset,
      subQuery = false,
      group,
    } = {},
  ) {
    try {
      const { rows, count } = await this.models[model].findAndCountAll({
        where: { ...where },
        include,
        attributes,
        order,
        limit,
        offset,
        subQuery,
        group,
      });

      return { rows: this.helper.database.formatData(rows), count };
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Description
   * Service function to count records based on given conditions
   * @async
   * @method
   * @name count
   * @kind method
   * @memberof CommonService
   * @param {any} where
   * @param {object} { model, include }?
   * @returns {Promise<any>}
   */
  async count(where, { model, include } = {}) {
    try {
      const count = await this.models[model].count({
        where: { ...where },
        distinct: true,
        include,
      });

      return count;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Description
   * Service to create a record
   * @async
   * @method
   * @name create
   * @kind method
   * @memberof CommonService
   * @param {any} record
   * @param {{ transaction: any }} { transaction }
   * @returns {Promise<string>} returns the agency ID
   */
  async create(record, { model, transaction }) {
    try {
      const toSave = {
        ...record,
      };
      toSave[`${model}_id`] = this.helper.generateId();
      await this.models[model].create(toSave, { transaction });
      return toSave[`${model}_id`];
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Description
   * Service to update a record
   * @async
   * @method
   * @name update
   * @kind method
   * @memberof CommonService
   * @param {any} where
   * @param {any} record
   * @param {{ transaction: any }} { transaction }
   * @returns {Promise<void>}
   */
  async update(where, record, { model, transaction } = {}) {
    try {
      await this.models[model].update(
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
   * Service function to hard delete a record of a given condition
   * @async
   * @method
   * @name destroy
   * @kind method
   * @memberof CommonService
   * @param {{ where: any }} { where }
   * @param {{ transaction: any }} { model, transaction }
   * @returns {Promise<void>}
   */
  async destroy(where, { model, transaction } = {}) {
    try {
      const record = await this.models[model].findOne({
        where: { ...where },
        transaction,
      });
      if (record) await record.destroy({ transaction });
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Description
   * Service function to hard delete multiple records of a given condition
   * @async
   * @method
   * @name destroyAll
   * @kind method
   * @memberof CommonService
   * @param {{ where: any }} { where }
   * @param {{ transaction: any }} { model, transaction }
   * @returns {Promise<void>}
   */
  async destroyAll(where, { model, transaction } = {}) {
    try {
      const records = await this.findAll({ ...where }, { model });
      if (records)
        await this.models[model].destroy(
          { where: { ...where } },
          { transaction },
        );
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Description
   * Service to create records
   * @async
   * @method
   * @name bulkCreate
   * @kind method
   * @memberof CommonService
   * @param {Array<any>} records - Array of records to insert
   * @param {{ transaction: any }} { transaction } - Optional transaction object
   * @returns {Promise<Array<any>>} - Array of created records
   */
  async bulkCreate(records, { model, transaction } = {}) {
    try {
      const createdRecords = await this.models[model].bulkCreate(records, {
        transaction,
      });
      return createdRecords;
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = CommonService;
