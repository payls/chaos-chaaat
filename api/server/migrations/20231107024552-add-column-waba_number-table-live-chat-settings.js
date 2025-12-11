'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'live_chat_settings',
        'waba_number',
        {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null,
          after: 'status',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('live_chat_settings', 'waba_number', {
        transaction,
      });
    });
  },
};
