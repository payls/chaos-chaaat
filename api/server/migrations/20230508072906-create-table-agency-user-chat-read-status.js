'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('agency_user_chat_read_status', {
      agency_user_chat_read_status_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      chat_id: {
        type: Sequelize.STRING,
      },
      chat_type: {
        type: Sequelize.STRING,
      },
      agency_user_fk: {
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
    return queryInterface.dropTable('agency_user_chat_read_status');
  },
};
