'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('contact_view', 'contact_view_status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'active',
      after: 'access_level',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('contact_view', 'contact_view_status');
  },
};
