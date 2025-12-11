'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('agency_user', 'title', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'agency_fk',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('agency_user', 'title');
  },
};
