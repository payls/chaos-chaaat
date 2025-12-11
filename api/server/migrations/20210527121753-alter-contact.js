'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('contact', 'profile_picture_url', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'permalink',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('contact', 'profile_picture_url');
  },
};
