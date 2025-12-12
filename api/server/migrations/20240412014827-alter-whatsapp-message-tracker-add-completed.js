'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'whatsapp_message_tracker',
        'completed',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          after: 'pending',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'whatsapp_message_tracker',
        'completed',
        {
          transaction,
        },
      );
    });
  },
};
