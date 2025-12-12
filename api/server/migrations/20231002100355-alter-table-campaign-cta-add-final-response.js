'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_1_final_response',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'trigger_cta_1_options',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_2_final_response',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'trigger_cta_2_options',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_3_final_response',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'trigger_cta_3_options',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_4_final_response',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'trigger_cta_4_options',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_5_final_response',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'trigger_cta_5_options',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'campaign_cta',
        'cta_1_final_response',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'campaign_cta',
        'cta_2_final_response',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'campaign_cta',
        'cta_3_final_response',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'campaign_cta',
        'cta_4_final_response',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'campaign_cta',
        'cta_5_final_response',
        {
          transaction,
        },
      );
    });
  },
};
