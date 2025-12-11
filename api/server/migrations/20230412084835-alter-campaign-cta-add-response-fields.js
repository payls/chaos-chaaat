'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_1_response',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_1',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'campaign_cta',
        'cta_2_response',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_2',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'campaign_cta',
        'cta_3_response',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_3',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('campaign_cta', 'cta_1_response', {
        transaction,
      });

      await queryInterface.removeColumn('campaign_cta', 'cta_2_response', {
        transaction,
      });

      await queryInterface.removeColumn('campaign_cta', 'cta_3_response', {
        transaction,
      });
    });
  },
};
