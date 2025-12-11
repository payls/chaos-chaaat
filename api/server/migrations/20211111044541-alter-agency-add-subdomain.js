'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('agency', 'agency_subdomain', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'agency_size',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('agency', 'agency_subdomain');
  },
};
