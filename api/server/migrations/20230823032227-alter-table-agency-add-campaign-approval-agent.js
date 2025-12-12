'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'agency',
        'campaign_approval_agent',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'agency_campaign_additional_recipient',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('agency', 'campaign_approval_agent', {
        transaction,
      });
    });
  },
};
