'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('task_permission', {
      task_permission_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      task_fk: { type: Sequelize.UUID },
      owner_type: { type: Sequelize.STRING },
      owner_fk: { type: Sequelize.UUID },
      action: { type: Sequelize.STRING },
      permission: { type: Sequelize.INTEGER },
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
    await queryInterface.dropTable('task_permission');
  },
};
