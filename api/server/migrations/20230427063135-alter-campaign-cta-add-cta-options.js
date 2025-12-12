'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'campaign_cta',
        'trigger_cta_1_options',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_1_response',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'campaign_cta',
        'trigger_cta_2_options',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_2_response',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'campaign_cta',
        'trigger_cta_3_options',
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
        'trigger_cta_1_options',
        {
          transaction,
        },
      );

      await queryInterface.removeColumn(
        'campaign_cta',
        'trigger_cta_2_options',
        {
          transaction,
        },
      );

      await queryInterface.removeColumn(
        'campaign_cta',
        'trigger_cta_3_options',
        {
          transaction,
        },
      );
    });
  },
};
