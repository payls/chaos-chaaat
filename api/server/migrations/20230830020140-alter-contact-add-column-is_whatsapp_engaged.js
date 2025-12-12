'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'contact',
        'whatsapp_engagement',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'all',
          after: 'status',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('contact', 'whatsapp_engagement', {
        transaction,
      });
    });
  },
};
