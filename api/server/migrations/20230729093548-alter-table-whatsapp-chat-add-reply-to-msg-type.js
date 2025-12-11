'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'whatsapp_chat',
        'reply_to_msg_type',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'reply_to_content',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('whatsapp_chat', 'reply_to_msg_type', {
        transaction,
      });
    });
  },
};
