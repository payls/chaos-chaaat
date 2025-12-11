'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'agency_whatsapp_config',
        'is_active',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          after: 'trial_code',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {},
};
