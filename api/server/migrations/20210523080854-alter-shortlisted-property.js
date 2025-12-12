'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'shortlisted_property',
      'property_rating_updated_date',
      {
        type: Sequelize.DATE,
        after: 'property_rating',
      },
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'shortlisted_property',
      'property_rating_updated_date',
    );
  },
};
