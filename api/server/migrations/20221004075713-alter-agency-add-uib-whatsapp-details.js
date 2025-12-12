'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'agency',
        'agency_whatsapp_api_token',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'agency_subdomain',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'agency',
        'agency_whatsapp_api_secret',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'agency_whatsapp_api_token',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('agency', 'agency_whatsapp_api_token', {
        transaction,
      });
      await queryInterface.removeColumn(
        'agency',
        'agency_whatsapp_api_secret',
        {
          transaction,
        },
      );
    });
  },
};
