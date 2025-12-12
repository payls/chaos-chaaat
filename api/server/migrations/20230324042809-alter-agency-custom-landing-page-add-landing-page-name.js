'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'agency_custom_landing_pages',
      'landing_page_name',
      {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'agency_fk',
      },
    );
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn(
      'agency_custom_landing_pages',
      'landing_page_name',
    );
  },
};
