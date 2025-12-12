'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('agency_whatsapp_config', {
      agency_whatsapp_config_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      agency_fk: {
        type: Sequelize.UUID,
      },
      waba_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      waba_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      agency_whatsapp_api_token: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      agency_whatsapp_api_secret: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      agency_waba_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      agency_waba_template_token: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      agency_waba_template_secret: {
        type: Sequelize.STRING,
        allowNull: false,
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
    return queryInterface.dropTable('agency_whatsapp_config');
  },
};
