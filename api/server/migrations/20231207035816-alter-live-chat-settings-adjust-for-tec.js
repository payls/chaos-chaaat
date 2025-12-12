'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'live_chat_settings',
        'api_url',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'salesforce_chat_logs_transmission_field',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'live_chat_settings',
        'api_token',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'api_url',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('live_chat_settings', 'api_url', {
        transaction,
      });
      await queryInterface.removeColumn('live_chat_settings', 'api_token', {
        transaction,
      });
    });
  },
};
