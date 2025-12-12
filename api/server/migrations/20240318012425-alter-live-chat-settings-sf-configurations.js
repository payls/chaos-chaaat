'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'live_chat_settings',
        'whatsapp_salesforce_transmission_type',
        { transaction },
      );

      await queryInterface.removeColumn(
        'live_chat_settings',
        'whatsapp_salesforce_chat_logs_transmission_enabled',
        { transaction },
      );

      await queryInterface.removeColumn(
        'live_chat_settings',
        'whatsapp_salesforce_chat_logs_transmission_field',
        { transaction },
      );
      await queryInterface.addColumn(
        'live_chat_settings',
        'api_oauth_url',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'salesforce_chat_logs_transmission_field',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'live_chat_settings',
        'api_update_url',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'api_url',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'live_chat_settings',
        'api_data_pull_url',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'api_update_url',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'live_chat_settings',
        'api_client_id',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'api_update_url',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'live_chat_settings',
        'api_client_secret',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'api_client_id',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'live_chat_settings',
        'api_update_url',
        {
          transaction,
        },
      );

      await queryInterface.removeColumn('live_chat_settings', 'api_oauth_url', {
        transaction,
      });

      await queryInterface.removeColumn('live_chat_settings', 'api_client_id', {
        transaction,
      });
      await queryInterface.removeColumn(
        'live_chat_settings',
        'api_client_secret',
        {
          transaction,
        },
      );
    });
  },
};
