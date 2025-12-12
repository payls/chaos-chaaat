'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'line_message_tracker',
        'failed_reason',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'failed',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'line_message_tracker',
        'failed_reason',
        {
          transaction,
        },
      );
    });
  },
};
