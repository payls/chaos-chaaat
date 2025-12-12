'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'agency_channel_config',
        'bot_id',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'channel_name',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'agency_channel_config',
        'sent_opt_in_message',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          after: 'channel_type',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'agency_channel_config',
        'opt_in_message',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'sent_opt_in_message',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('agency_channel_config', 'bot_id', {
        transaction,
      });
      await queryInterface.removeColumn(
        'agency_channel_config',
        'sent_opt_in_message',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'agency_channel_config',
        'opt_in_message',
        {
          transaction,
        },
      );
    });
  },
};
