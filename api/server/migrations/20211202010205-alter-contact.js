'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('contact', 'permalink_created_date', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
      after: 'permalink_message',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('contact', 'permalink_created_date');
  },
};
