'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'agency_channel_config',
        'opt_in_message_sent_date',
        {
          allowNull: true,
          type: 'TIMESTAMP',
          defaultValue: Sequelize.literal(
            'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
          ),
          after: 'opt_in_message',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'agency_channel_config',
        'opt_in_message_sent_date',
        {
          transaction,
        },
      );
    });
  },
};
