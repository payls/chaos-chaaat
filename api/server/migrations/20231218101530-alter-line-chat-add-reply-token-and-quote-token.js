'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'line_chat',
        'reply_token',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'msg_body',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'line_chat',
        'quote_token',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'reply_token',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('line_chat', 'reply_token', {
        transaction,
      });
      await queryInterface.removeColumn('line_chat', 'quote_token', {
        transaction,
      });
    });
  },
};
