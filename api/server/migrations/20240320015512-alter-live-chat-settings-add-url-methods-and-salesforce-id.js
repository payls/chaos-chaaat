'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'live_chat_settings',
        'oauth_method',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'api_oauth_url',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'live_chat_settings',
        'create_method',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'api_url',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'live_chat_settings',
        'update_method',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'api_update_url',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'live_chat_settings',
        'add_salesforce_id',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          after: 'update_method',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'live_chat_settings',
        'pull_method',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'api_data_pull_url',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'live_chat_settings',
        'field_configuration',
        {
          transaction,
        },
      );
    });
  },
};
