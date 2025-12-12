'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('whatsapp_onboarding', {
      whatsapp_onboarding_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      agency_fk: {
        type: Sequelize.STRING,
      },
      customer: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'YourPave',
      },
      onboarding_channel: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'WhatsApp Embedded Signup',
      },
      facebook_manager_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      client_company_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      display_image: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      whatsapp_status: {
        type: Sequelize.STRING,
        defaultValue: 'Available',
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      website: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      webhook_url: {
        type: Sequelize.STRING,
        defaultValue: 'https://api.chaaat.io/v1/whatsapp/message/webhook',
      },
      headers: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'pending',
      },
      created_by: {
        type: Sequelize.STRING,
      },
      created_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_by: {
        type: Sequelize.STRING,
      },
      updated_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        ),
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('whatsapp_onboarding');
  },
};
