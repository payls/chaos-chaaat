'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'whatsapp_message_tracker',
        'agency_user_fk',
        {
          type: Sequelize.UUID,
          allowNull: true,
          after: 'agency_fk',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'whatsapp_message_tracker',
        'agency_user_fk',
        {
          transaction,
        },
      );
    });
  },
};
