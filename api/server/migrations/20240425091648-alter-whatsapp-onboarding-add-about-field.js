'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'whatsapp_onboarding',
        'about',
        {
          type: Sequelize.TEXT('long'),
          allowNull: true,
          after: 'display_image',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('whatsapp_onboarding', 'about', {
        transaction,
      });
    });
  },
};
