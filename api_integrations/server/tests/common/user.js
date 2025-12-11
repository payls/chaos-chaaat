const constants = require('../../constants/constant.json');
const models = require('../../models');
const userController = require('../../controllers/user').makeUserController(
  models,
);
module.exports = {
  /**
   *
   * @param {string} firstName
   * @param {string} lastName
   * @param {string} email
   * @return {Promise<string>}
   */
  initUser: async (firstName, lastName, email) => {
    return userController.create({
      first_name: firstName,
      last_name: lastName,
      email,
      status: constants.USER.STATUS.ACTIVE,
    });
  },
};
