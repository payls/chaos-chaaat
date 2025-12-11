'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'live_chat_settings',
        'styles',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          defaultValue: null,
          after: 'chat_frequency',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('live_chat_settings', 'styles', {
        transaction,
      });
    });
  },
};
