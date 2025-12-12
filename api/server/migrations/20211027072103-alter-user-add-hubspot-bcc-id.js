'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('user', 'hubspot_bcc_id', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'mobile_number',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('user', 'hubspot_bcc_id');
  },
};
