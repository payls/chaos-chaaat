'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'contact',
        'paused_automation',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          after: 'whatsapp_engagement',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('contact', 'paused_automation', {
        transaction,
      });
    });
  },
};
