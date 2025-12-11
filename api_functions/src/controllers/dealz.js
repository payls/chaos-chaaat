const Promise = require('bluebird');

class DealzController {
  constructor() {
    const CommonService = require('../services/common');
    this.service = {
      common: new CommonService(),
    };
    this.sequelize = require('sequelize');
    const { Op } = require('sequelize');
    this.Op = Op;
  }

  /**
   * Description
   * Function to update dealz weight based on validity dates and status
   * @async
   * @method
   * @name processDealzWeightUpdate
   * @kind method
   * @memberof DealzController
   * @returns {globalThis.Promise<boolean>}
   */
  async processDealzWeightUpdate() {
    try {
      const dealz = await this.service.common.findAll(
        { status: 'approved' },
        { model: 'dealz' },
      );
      const today = new Date().toISOString().split('T')[0];
      // loop through all dealz and update the weight based on the validity dates
      await Promise.mapSeries(dealz, async (record) => {
        console.log(record);
        let weight = 0;
        // if status is approved, check the weight to assign based on validity dates
        const startDate = record.valid_date_from;
        const endDate = record.valid_date_to;
        console.log({ today: today, start: startDate, end: endDate });
        if (today < startDate) {
          weight = 5;
        } else if (today > endDate) {
          weight = 5;
        } else {
          weight = 10;
        }
        await this.service.common.update(
          { dealz_id: record.dealz_id },
          { weight },
          { model: 'dealz' },
        );
      });
      // update weight to 0 for all dealz that are not approved
      await this.service.common.update(
        {
          status: {
            [this.Op.ne]: 'approved',
          },
        },
        { weight: 0 },
        { model: 'dealz' },
      );
      return true;
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = DealzController;
