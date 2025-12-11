'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('integrations_access_keys', {
      integrations_access_keys_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      integrations_fk: {
        type: Sequelize.UUID,
      },
      client_id: {
        type: Sequelize.STRING,
      },
      client_secret: {
        type: Sequelize.STRING,
      },
      oauth_token: {
        type: Sequelize.STRING,
      },
      client_access_token: {
        type: Sequelize.STRING,
      },
      refresh_token: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('integrations_access_keys');
  },
};
