'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'live_chat_settings',
        'api_update_token',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'api_token',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'live_chat_settings',
        'api_update_token',
        {
          transaction,
        },
      );
    });
  },
};
