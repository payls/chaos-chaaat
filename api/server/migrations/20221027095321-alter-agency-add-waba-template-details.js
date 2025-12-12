'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'agency',
        'agency_waba_id',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'agency_whatsapp_api_secret',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'agency',
        'agency_waba_template_token',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'agency_waba_id',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'agency',
        'agency_waba_template_secret',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'agency_waba_template_token',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('agency', 'agency_waba_id', {
        transaction,
      });
      await queryInterface.removeColumn(
        'agency',
        'agency_waba_template_token',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'agency',
        'agency_waba_template_secret',
        {
          transaction,
        },
      );
    });
  },
};
