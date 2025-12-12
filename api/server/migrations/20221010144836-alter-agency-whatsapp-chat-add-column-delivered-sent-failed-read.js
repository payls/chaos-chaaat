'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'whatsapp_chat',
        'delivered',
        {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          after: 'receiver_url',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'whatsapp_chat',
        'sent',
        {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          after: 'delivered',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'whatsapp_chat',
        'failed',
        {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          after: 'sent',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'whatsapp_chat',
        'read',
        {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          after: 'failed',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('whatsapp_chat', 'delivered', {
        transaction,
      });

      await queryInterface.removeColumn('whatsapp_chat', 'sent', {
        transaction,
      });

      await queryInterface.removeColumn('whatsapp_chat', 'failed', {
        transaction,
      });

      await queryInterface.removeColumn('whatsapp_chat', 'read', {
        transaction,
      });
    });
  },
};
