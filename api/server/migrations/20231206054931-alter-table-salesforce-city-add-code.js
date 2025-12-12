'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'agency_salesforce_city',
        'code',
        {
          type: Sequelize.STRING,
          allowNull: false,
          after: 'name',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('agency_salesforce_city', 'code', {
        transaction,
      });
    });
  },
};
