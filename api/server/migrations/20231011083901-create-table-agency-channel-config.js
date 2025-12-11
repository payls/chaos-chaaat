'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('agency_channel_config', {
      agency_channel_config_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      agency_fk: {
        type: Sequelize.UUID,
      },
      channel_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      channel_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      channel_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      uib_api_token: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      uib_api_secret: {
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
    return queryInterface.dropTable('agency_channel_config');
  },
};
