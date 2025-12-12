'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_1_opt_out',
        {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          after: 'trigger_cta_1_options',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_2_opt_out',
        {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          after: 'trigger_cta_2_options',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_3_opt_out',
        {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          after: 'trigger_cta_3_options',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_4_response',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'cta_3_opt_out',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'trigger_cta_4_options',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_4_response',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_4_opt_out',
        {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          after: 'trigger_cta_4_options',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_5_response',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'cta_4_opt_out',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'trigger_cta_5_options',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_5_response',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_5_opt_out',
        {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          after: 'trigger_cta_5_options',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('campaign_cta', 'cta_1_opt_out', {
        transaction,
      });
      await queryInterface.removeColumn('campaign_cta', 'cta_2_opt_out', {
        transaction,
      });
      await queryInterface.removeColumn('campaign_cta', 'cta_3_opt_out', {
        transaction,
      });
      await queryInterface.removeColumn('campaign_cta', 'cta_4_response', {
        transaction,
      });
      await queryInterface.removeColumn(
        'campaign_cta',
        'trigger_cta_4_options',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn('campaign_cta', 'cta_4_opt_out', {
        transaction,
      });
      await queryInterface.removeColumn('campaign_cta', 'cta_5_response', {
        transaction,
      });
      await queryInterface.removeColumn(
        'campaign_cta',
        'trigger_cta_5_options',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn('campaign_cta', 'cta_5_opt_out', {
        transaction,
      });
    });
  },
};
