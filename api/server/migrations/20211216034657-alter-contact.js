'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('contact', 'permalink_last_opened', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
      after: 'permalink_created_date',
    });
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('contact', 'permalink_last_opened');
  },
};
