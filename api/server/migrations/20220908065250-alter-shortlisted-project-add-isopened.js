'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('shortlisted_project', 'is_opened', {
      type: Sequelize.TINYINT,
      allowNull: true,
      defaultValue: 0,
      after: 'project_rating',
    });
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('shortlisted_project', 'is_opened');
  },
};
