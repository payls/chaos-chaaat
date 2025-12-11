'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'whatsapp_message_tracker',
        'addtl_1_done',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          after: 'visible',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'whatsapp_message_tracker',
        'addtl_2_done',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          after: 'addtl_1_done',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'whatsapp_message_tracker',
        'addtl_3_done',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          after: 'addtl_2_done',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'whatsapp_message_tracker',
        'addtl_1_done',
        {
          transaction,
        },
      );

      await queryInterface.removeColumn(
        'whatsapp_message_tracker',
        'addtl_2_done',
        {
          transaction,
        },
      );

      await queryInterface.removeColumn(
        'whatsapp_message_tracker',
        'addtl_3_done',
        {
          transaction,
        },
      );
    });
  },
};
