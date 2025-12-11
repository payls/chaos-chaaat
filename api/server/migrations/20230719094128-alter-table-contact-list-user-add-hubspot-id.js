'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'contact_list_user',
        'hubspot_id',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'contact_id',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('contact_list_user', 'hubspot_id', {
        transaction,
      });
    });
  },
};
