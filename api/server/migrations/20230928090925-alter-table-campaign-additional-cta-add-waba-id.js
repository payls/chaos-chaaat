'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'campaign_additional_cta',
        'agency_whatsapp_config_fk',
        {
          type: Sequelize.STRING,
          allowNull: false,
          after: 'agency_fk',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'campaign_additional_cta',
        'agency_whatsapp_config_fk',
        {
          transaction,
        },
      );
    });
  },
};
