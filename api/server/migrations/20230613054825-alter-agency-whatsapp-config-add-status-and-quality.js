'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'agency_whatsapp_config',
        'waba_status',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'agency_waba_template_secret',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'agency_whatsapp_config',
        'waba_quality',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'waba_status',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'agency_whatsapp_config',
        'waba_status',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'agency_whatsapp_config',
        'waba_quality',
        {
          transaction,
        },
      );
    });
  },
};
