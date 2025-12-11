const models = require('../../models');
const agencyUserController =
  require('../../controllers/agencyUser').makeAgencyUserController(models);
module.exports = {
  /**
   *
   * @param {string} userId
   * @param {string} agencyId
   * @return {Promise<string>}
   */
  initAgencyUser: async (userId, agencyId) => {
    return agencyUserController.create({
      user_fk: userId,
      agency_fk: agencyId,
    });
  },
};
