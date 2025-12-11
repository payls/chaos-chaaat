'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'unified_inbox',
        'msg_id',
        {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null,
          after: 'receiver_url',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('unified_inbox', 'msg_id', {
        transaction,
      });
    });
  },
};
