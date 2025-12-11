'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'live_chat_settings',
        'line_salesforce_enabled',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
          after: 'whatsapp_salesforce_enabled',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'live_chat_settings',
        'line_salesforce_enabled',
        {
          transaction,
        },
      );
    });
  },
};
