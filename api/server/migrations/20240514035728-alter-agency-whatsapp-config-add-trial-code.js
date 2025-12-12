'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'agency_whatsapp_config',
        'trial_code',
        {
          type: Sequelize.STRING(10),
          allowNull: true,
          defaultValue: null,
          after: 'trial_number_to_use',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'agency_whatsapp_config',
        'trial_code',
        {
          transaction,
        },
      );
    });
  },
};
