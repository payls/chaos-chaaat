'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('agency', 'agency_logo_url', {
      type: Sequelize.TEXT,
      after: 'agency_name',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('agency', 'agency_logo_url');
  },
};
