'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'whatsapp_chat',
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
      await queryInterface.removeColumn('whatsapp_chat', 'failed_reason', {
        transaction,
      });
    });
  },
};
