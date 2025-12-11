'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'agency_whatsapp_config',
        'daily_messaging_limit',
        {
          type: Sequelize.STRING,
          defaultValue: null,
          allowNull: true,
          after: 'waba_quality',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'agency_whatsapp_config',
        'daily_messaging_limit',
        {
          transaction,
        },
      );
    });
  },
};
