'use strict';
const constant = require('../constants/constant.json');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('contact', 'lead_status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: constant.LEAD_STATUS.NO_PROPOSAL,
      after: 'permalink_created_date',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('contact', 'lead_status');
  },
};
