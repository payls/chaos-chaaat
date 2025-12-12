'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('shortlisted_property', 'display_order', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'contact_fk',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('shortlisted_property', 'display_order');
  },
};
