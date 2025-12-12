'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('project', 'sf_project_id', {
      type: Sequelize.STRING,
      after: 'brochure_url',
    });
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('project', 'sf_project_id');
  },
};
