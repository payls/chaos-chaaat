'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.renameColumn(
        'line_chat',
        'reply_to_event_id',
        'reply_to_msg_id',
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.renameColumn(
        'line_chat',
        'reply_to_msg_id',
        'reply_to_event_id',
        {
          transaction,
        },
      );
    });
  },
};
