const h = require('../../helpers');
const StaffCommon = require('./common');

class StaffContactService extends StaffCommon {
  constructor() {
    super();
    this.contactController =
      require('../../controllers/contact').makeContactController(this.models);
  }

  async checkIfPermalinkIsUnique(permalink) {
    if (
      await this.contactController.findOne(
        { permalink },
        { transaction: this.dbTransaction },
      )
    ) {
      return this.checkIfPermalinkIsUnique(
        h.general.generateRandomAlpanumeric(5),
      );
    } else {
      return permalink;
    }
  }
}

module.exports = StaffContactService;
