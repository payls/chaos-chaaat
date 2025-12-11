'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'live_chat_settings',
        'whatsapp_salesforce_enabled',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
          after: 'waba_number',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'live_chat_settings',
        'whatsapp_salesforce_transmission_type',
        {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null,
          after: 'whatsapp_salesforce_enabled',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'live_chat_settings',
        'whatsapp_salesforce_chat_logs_transmission_enabled',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
          after: 'whatsapp_salesforce_transmission_type',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'live_chat_settings',
        'whatsapp_salesforce_chat_logs_transmission_field',
        {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null,
          after: 'whatsapp_salesforce_chat_logs_transmission_enabled',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'live_chat_settings',
        'whatsapp_salesforce_enabled',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'live_chat_settings',
        'whatsapp_salesforce_transmission_type',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'live_chat_settings',
        'whatsapp_salesforce_chat_logs_transmission_enabled',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'live_chat_settings',
        'whatsapp_salesforce_chat_logs_transmission_field',
        {
          transaction,
        },
      );
    });
  },
};
