'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'campaign_cta',
        'message_channel',
        {
          type: Sequelize.STRING,
          defaultValue: 'whatsapp',
          after: 'campaign_tracker_ref_name',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'is_workflow',
        {
          type: Sequelize.STRING,
          defaultValue: false,
          allowNull: false,
          after: 'message_channel',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'campaign_cta',
        'message_flow_data',
        {
          type: Sequelize.TEXT('long'),
          defaultValue: null,
          allowNull: true,
          after: 'is_workflow',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('campaign_cta', 'message_channel', {
        transaction,
      });
      await queryInterface.removeColumn('campaign_cta', 'is_workflow', {
        transaction,
      });
      await queryInterface.removeColumn('campaign_cta', 'message_flow_data', {
        transaction,
      });
    });
  },
};
