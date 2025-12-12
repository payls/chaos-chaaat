'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.renameColumn(
      'contact',
      'permalink_created_date',
      'permalink_sent_date',
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.renameColumn(
      'contact',
      'permalink_sent_date',
      'permalink_created_date',
    );
  },
};
