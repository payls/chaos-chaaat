'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('project_team_behind', {
      project_team_behind_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      project_fk: { type: Sequelize.UUID },
      type: { type: Sequelize.STRING },
      name: { type: Sequelize.STRING },
      logo_url: { type: Sequelize.TEXT },
      description: { type: Sequelize.TEXT },
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
    await queryInterface.dropTable('project_team_behind');
  },
};
