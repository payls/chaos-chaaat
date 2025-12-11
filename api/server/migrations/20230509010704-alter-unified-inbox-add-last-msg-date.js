'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'unified_inbox',
        'last_msg_date',
        {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
          after: 'broadcast_date',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('unified_inbox', 'last_msg_date', {
        transaction,
      });
    });
  },
};
