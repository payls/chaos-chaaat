'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'campaign_schedule',
        'platform',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'whatsapp',
          after: 'time_zone',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('campaign_schedule', 'platform', {
        transaction,
      });
    });
  },
};
