'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('agency_user', 'youtube', {
      type: Sequelize.STRING,
      after: 'facebook',
    });
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('agency_user', 'youtube');
  },
};
