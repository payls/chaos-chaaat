'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'whatsapp_chat',
        'reply_to_file_name',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'reply_to_msg_type',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('whatsapp_chat', 'reply_to_file_name', {
        transaction,
      });
    });
  },
};
