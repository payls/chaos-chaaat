'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'contact_property_definitions',
      'attribute_source_field',
      {
        type: Sequelize.STRING,
        after: 'attribute_source',
      },
    );
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn(
      'contact_property_definitions',
      'attribute_source_field',
    );
  },
};
