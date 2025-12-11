'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('agency_user_tray', {
      agency_user_tray_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      agency_user_fk: {
        type: Sequelize.UUID,
      },
      tray_user_fk: {
        type: Sequelize.TEXT,
      },
      tray_user_fk_master_token: {
        type: Sequelize.TEXT,
      },
      tray_user_name: {
        type: Sequelize.TEXT,
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
      },
      source_meta: {
        type: Sequelize.TEXT,
      },
      source_original_payload: {
        type: Sequelize.TEXT,
      },
      created_by: { type: Sequelize.STRING },
      created_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_by: { type: Sequelize.STRING },
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
    await queryInterface.dropTable('agency_user_tray');
  },
};
