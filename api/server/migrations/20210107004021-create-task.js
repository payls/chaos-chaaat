'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('task', {
      task_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      owner_type: { type: Sequelize.STRING },
      owner_fk: { type: Sequelize.UUID },
      subject: { type: Sequelize.TEXT },
      type: { type: Sequelize.STRING },
      type_sub: { type: Sequelize.STRING },
      status: { type: Sequelize.STRING },
      status_updated_date: { type: Sequelize.DATE },
      is_deleted: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0,
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
    await queryInterface.dropTable('task');
  },
};
