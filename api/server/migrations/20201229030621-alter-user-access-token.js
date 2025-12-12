'use strict';
const constant = require('../constants/constant.json');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('user_access_token', 'status', {
      type: Sequelize.ENUM(Object.values(constant.USER.ACCESS_TOKEN.STATUS)),
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {},
};
