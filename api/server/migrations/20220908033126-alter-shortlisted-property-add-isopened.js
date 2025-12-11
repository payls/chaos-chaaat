'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('shortlisted_property', 'is_opened', {
      type: Sequelize.TINYINT,
      allowNull: true,
      defaultValue: 0,
      after: 'property_rating',
    });
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('shortlisted_property', 'is_opened');
  },
};
