'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('agency', 'real_estate_type', {
      type: Sequelize.STRING,
      defaultValue: 'REAL_ESTATE',
      after: 'agency_type',
    });
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('agency', 'real_estate_type');
  },
};
