'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'campaign_schedule',
        'campaign_name',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'campaign_schedule_id',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'campaign_schedule',
        'recipient_count',
        {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          after: 'campaign_name',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'campaign_schedule',
        'slack_notification',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'recipient_count',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('campaign_schedule', 'campaign_name', {
        transaction,
      });

      await queryInterface.removeColumn(
        'campaign_schedule',
        'recipient_count',
        {
          transaction,
        },
      );

      await queryInterface.removeColumn(
        'campaign_schedule',
        'slack_notification',
        {
          transaction,
        },
      );
    });
  },
};
