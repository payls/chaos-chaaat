'use strict';
const constant = require('../constants/constant.json');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('property', 'status', {
      type: Sequelize.ENUM(Object.values(constant.PROPERTY.STATUS)),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {},
};
