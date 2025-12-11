const h = require('../../helpers');
const StaffCommon = require('./common');

class StaffInventoryService extends StaffCommon {
  constructor() {
    super();
    this.contact = require('../../controllers/contact').makeContactController(
      this.models,
    );
    this.whatsappChat =
      require('../../controllers/whatsappChat').makeController(this.models);
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

module.exports = StaffInventoryService;
