'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('contact', 'lead_score', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      after: 'mobile_number',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('contact', 'lead_score');
  },
};
