'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('project_property', 'floor', {
      type: Sequelize.STRING,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('project_property', 'floor', {
      type: Sequelize.INTEGER,
    });
  },
};
