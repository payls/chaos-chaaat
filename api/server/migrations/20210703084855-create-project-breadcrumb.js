'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('project_breadcrumb', {
      project_breadcrumb_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      project_fk: { type: Sequelize.UUID },
      text: { type: Sequelize.STRING },
      url: { type: Sequelize.STRING },
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
    await queryInterface.dropTable('project_breadcrumb');
  },
};
