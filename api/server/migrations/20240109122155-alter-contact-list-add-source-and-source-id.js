'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'contact_list',
        'source_type',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'list_property_value',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'contact_list',
        'source_value',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'source_type',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('contact_list', 'source_type', {
        transaction,
      });
      await queryInterface.removeColumn('contact_list', 'source_value', {
        transaction,
      });
    });
  },
};
