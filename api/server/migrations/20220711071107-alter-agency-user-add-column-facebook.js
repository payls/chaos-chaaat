'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'agency_user',
        'facebook',
        { type: Sequelize.TEXT, allowNull: true, after: 'linkedin' },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('agency_user', 'facebook', {
        transaction,
      });
    });
  },
};
