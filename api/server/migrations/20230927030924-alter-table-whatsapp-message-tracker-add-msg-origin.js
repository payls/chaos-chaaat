'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'whatsapp_message_tracker',
        'msg_origin',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'campaign',
          after: 'msg_id',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('whatsapp_message_tracker', 'msg_id', {
        transaction,
      });
    });
  },
};
