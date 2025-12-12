'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'whatsapp_chat',
        'msg_origin',
        {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: 'campaign',
          after: 'msg_type',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('whatsapp_chat', 'msg_origin', {
        transaction,
      });
    });
  },
};
