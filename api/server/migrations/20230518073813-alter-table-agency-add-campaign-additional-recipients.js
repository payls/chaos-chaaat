'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'agency',
        'agency_campaign_additional_recipient',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'agency_waba_template_secret',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'agency',
        'agency_campaign_additional_recipient',
        {
          transaction,
        },
      );
    });
  },
};
