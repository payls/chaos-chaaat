'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('shortlisted_project', 'project_rating', {
      type: Sequelize.TINYINT,
      allowNull: true,
      defaultValue: 0,
      after: 'contact_fk',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('shortlisted_project', 'project_rating');
  },
};
