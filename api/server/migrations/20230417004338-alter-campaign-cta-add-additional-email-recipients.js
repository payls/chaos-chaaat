'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'campaign_cta',
        'campaign_notification_additional_recipients',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_3_response',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'campaign_cta',
        'campaign_notification_additional_recipients',
        {
          transaction,
        },
      );
    });
  },
};
