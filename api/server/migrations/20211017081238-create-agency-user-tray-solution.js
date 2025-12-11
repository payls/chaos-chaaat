'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('agency_user_tray_solution', {
      agency_user_tray_solution_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      agency_user_tray_fk: {
        type: Sequelize.UUID,
      },
      tray_user_config_wizard_id: {
        type: Sequelize.TEXT,
      },
      tray_user_solution_id: {
        type: Sequelize.TEXT,
      },
      tray_user_solution_source_type: {
        type: Sequelize.TEXT,
      },
      tray_user_solution_instance_id: {
        type: Sequelize.TEXT,
      },
      tray_user_solution_instance_auth: {
        type: Sequelize.TEXT,
      },
      tray_user_solution_instance_webhook_trigger: {
        type: Sequelize.TEXT,
      },
      tray_user_solution_instance_status: {
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
    await queryInterface.dropTable('agency_user_tray_solution');
  },
};
