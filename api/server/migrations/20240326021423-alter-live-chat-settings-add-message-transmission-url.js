'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'live_chat_settings',
        'api_message_url',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'update_method',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'live_chat_settings',
        'message_method',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'api_message_url',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'live_chat_settings',
        'api_message_token',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'api_update_token',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'live_chat_settings',
        'api_message_token',
        {
          transaction,
        },
      );
    });
  },
};
