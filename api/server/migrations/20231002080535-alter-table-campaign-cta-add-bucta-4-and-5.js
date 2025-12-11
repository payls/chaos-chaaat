'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_4',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_3_opt_out',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_5',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_4_opt_out',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('campaign_cta', 'cta_4', {
        transaction,
      });
      await queryInterface.removeColumn('campaign_cta', 'cta_5', {
        transaction,
      });
    });
  },
};
