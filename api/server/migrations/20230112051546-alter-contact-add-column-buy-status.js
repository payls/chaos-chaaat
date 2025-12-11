'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'contact',
        'buy_status',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'lead_status',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('contact', 'buy_status', {
        transaction,
      });
    });
  },
};
