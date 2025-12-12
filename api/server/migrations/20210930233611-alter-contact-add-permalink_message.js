'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('contact', 'permalink_message', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'permalink',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('contact', 'permalink_message');
  },
};
