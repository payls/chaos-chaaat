'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'project_team_behind',
        'title',
        { type: Sequelize.TEXT, allowNull: true, after: 'description' },
        { transaction },
      );
      await queryInterface.addColumn(
        'project_team_behind',
        'filename',
        { type: Sequelize.TEXT, allowNull: true, after: 'title' },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('project_team_behind', 'title', {
        transaction,
      });
      await queryInterface.removeColumn('project_team_behind', 'filename', {
        transaction,
      });
    });
  },
};
