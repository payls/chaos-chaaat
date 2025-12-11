'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('live_chat_settings', {
      live_chat_settings_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      agency_fk: {
        type: Sequelize.STRING,
      },
      allowed_domain: {
        type: Sequelize.STRING,
      },
      chat_start_time: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      chat_end_time: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      chat_frequency: {
        type: Sequelize.STRING,
        defaultValue: 'A few minutes',
      },
      agency_user_fk: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'active',
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
    return queryInterface.dropTable('live_chat_settings');
  },
};
