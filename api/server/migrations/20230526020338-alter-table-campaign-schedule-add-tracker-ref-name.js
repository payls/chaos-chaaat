'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'campaign_schedule',
        'tracker_ref_name',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'agency_fk',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'campaign_schedule',
        'tracker_ref_name',
        {
          transaction,
        },
      );
    });
  },
};
