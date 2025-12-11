'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'campaign_schedule',
        'agency_fk',
        {
          type: Sequelize.UUID,
          allowNull: true,
          after: 'campaign_schedule_id',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'campaign_schedule',
        'status',
        {
          type: Sequelize.INTEGER,
          defaultValue: 1,
          after: 'time_zone',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('campaign_schedule', 'agency_fk', {
        transaction,
      });
      await queryInterface.removeColumn('campaign_schedule', 'status', {
        transaction,
      });
    });
  },
};
