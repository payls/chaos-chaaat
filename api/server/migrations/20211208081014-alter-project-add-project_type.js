'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('project', 'project_type', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
      after: 'description',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('project', 'project_type');
  },
};
