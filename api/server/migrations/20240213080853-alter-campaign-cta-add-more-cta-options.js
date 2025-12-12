'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_6',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_5_option_type',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_6_response',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'cta_6',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'trigger_cta_6_options',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_6_response',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_6_final_response',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'trigger_cta_6_options',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_6_option_type',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          after: 'cta_6_final_response',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'campaign_cta',
        'cta_7',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_6_option_type',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_7_response',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'cta_7',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'trigger_cta_7_options',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_7_response',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_7_final_response',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'trigger_cta_7_options',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_7_option_type',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          after: 'cta_7_final_response',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'campaign_cta',
        'cta_8',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_7_option_type',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_8_response',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'cta_8',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'trigger_cta_8_options',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_8_response',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_8_final_response',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'trigger_cta_8_options',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_8_option_type',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          after: 'cta_8_final_response',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'campaign_cta',
        'cta_9',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_8_option_type',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_9_response',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'cta_9',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'trigger_cta_9_options',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_9_response',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_9_final_response',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'trigger_cta_9_options',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_9_option_type',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          after: 'cta_9_final_response',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'campaign_cta',
        'cta_10',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_9_option_type',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_10_response',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'cta_10',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'trigger_cta_10_options',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_10_response',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_10_final_response',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'trigger_cta_10_options',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'cta_10_option_type',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          after: 'cta_10_final_response',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('campaign_cta', 'cta_6', {
        transaction,
      });
      await queryInterface.removeColumn('campaign_cta', 'cta_6_response', {
        transaction,
      });
      await queryInterface.removeColumn(
        'campaign_cta',
        'trigger_cta_6_options',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'campaign_cta',
        'cta_6_final_response',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn('campaign_cta', 'cta_6_option_type', {
        transaction,
      });

      await queryInterface.removeColumn('campaign_cta', 'cta_7', {
        transaction,
      });
      await queryInterface.removeColumn('campaign_cta', 'cta_7_response', {
        transaction,
      });
      await queryInterface.removeColumn(
        'campaign_cta',
        'trigger_cta_7_options',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'campaign_cta',
        'cta_7_final_response',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn('campaign_cta', 'cta_7_option_type', {
        transaction,
      });

      await queryInterface.removeColumn('campaign_cta', 'cta_8', {
        transaction,
      });
      await queryInterface.removeColumn('campaign_cta', 'cta_8_response', {
        transaction,
      });
      await queryInterface.removeColumn(
        'campaign_cta',
        'trigger_cta_8_options',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'campaign_cta',
        'cta_8_final_response',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn('campaign_cta', 'cta_8_option_type', {
        transaction,
      });

      await queryInterface.removeColumn('campaign_cta', 'cta_9', {
        transaction,
      });
      await queryInterface.removeColumn('campaign_cta', 'cta_9_response', {
        transaction,
      });
      await queryInterface.removeColumn(
        'campaign_cta',
        'trigger_cta_9_options',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'campaign_cta',
        'cta_9_final_response',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn('campaign_cta', 'cta_9_option_type', {
        transaction,
      });

      await queryInterface.removeColumn('campaign_cta', 'cta_10', {
        transaction,
      });
      await queryInterface.removeColumn('campaign_cta', 'cta_10_response', {
        transaction,
      });
      await queryInterface.removeColumn(
        'campaign_cta',
        'trigger_cta_10_options',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'campaign_cta',
        'cta_10_final_response',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn('campaign_cta', 'cta_10_option_type', {
        transaction,
      });
    });
  },
};
