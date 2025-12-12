'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'agency_whatsapp_config',
        'whatsapp_onboarding_fk',
        {
          type: Sequelize.UUID,
          allowNull: true,
          after: 'agency_fk',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'agency_whatsapp_config',
        'whatsapp_onboarding_fk',
        {
          transaction,
        },
      );
    });
  },
};
