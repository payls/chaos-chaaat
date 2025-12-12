'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('campaign_cta', 'cta_1_opt_out', {
        transaction,
      });
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_1_option_type',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          after: 'cta_1_final_response',
        },
        { transaction },
      );
      await queryInterface.removeColumn('campaign_cta', 'cta_2_opt_out', {
        transaction,
      });
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_2_option_type',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          after: 'cta_2_final_response',
        },
        { transaction },
      );
      await queryInterface.removeColumn('campaign_cta', 'cta_3_opt_out', {
        transaction,
      });
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_3_option_type',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          after: 'cta_3_final_response',
        },
        { transaction },
      );
      await queryInterface.removeColumn('campaign_cta', 'cta_4_opt_out', {
        transaction,
      });
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_4_option_type',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          after: 'cta_4_final_response',
        },
        { transaction },
      );
      await queryInterface.removeColumn('campaign_cta', 'cta_5_opt_out', {
        transaction,
      });
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_5_option_type',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          after: 'cta_5_final_response',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('campaign_cta', 'cta_1_option_type', {
        transaction,
      });
      await queryInterface.removeColumn('campaign_cta', 'cta_2_option_type', {
        transaction,
      });
      await queryInterface.removeColumn('campaign_cta', 'cta_3_option_type', {
        transaction,
      });
      await queryInterface.removeColumn('campaign_cta', 'cta_4_option_type', {
        transaction,
      });
      await queryInterface.removeColumn('campaign_cta', 'cta_5_option_type', {
        transaction,
      });
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
};
