'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'contact_list',
        'list_type',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'user_count',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'contact_list',
        'list_property_name',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'list_type',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'contact_list',
        'list_property_value',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'list_property_name',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('contact_list', 'list_type', {
        transaction,
      });
      await queryInterface.removeColumn('contact_list', 'list_property_name', {
        transaction,
      });
      await queryInterface.removeColumn('contact_list', 'list_property_value', {
        transaction,
      });
    });
  },
};
