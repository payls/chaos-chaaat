'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'agency_whatsapp_config',
        'trial_number',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          after: 'daily_messaging_limit',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'agency_whatsapp_config',
        'trial_number_to_use',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          after: 'trial_number',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'agency_whatsapp_config',
        'trial_number',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'agency_whatsapp_config',
        'trial_number_to_use',
        {
          transaction,
        },
      );
    });
  },
};
