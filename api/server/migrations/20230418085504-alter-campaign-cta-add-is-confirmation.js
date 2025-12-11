'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'campaign_cta',
        'is_confirmation',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          after: 'campaign_notification_additional_recipients',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('campaign_cta', 'is_confirmation', {
        transaction,
      });
    });
  },
};
