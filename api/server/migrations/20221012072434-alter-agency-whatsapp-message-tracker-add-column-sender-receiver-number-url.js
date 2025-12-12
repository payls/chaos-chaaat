'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'whatsapp_message_tracker',
        'sender_number',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'batch_count',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'whatsapp_message_tracker',
        'sender_url',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'sender_number',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'whatsapp_message_tracker',
        'receiver_number',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'sender_url',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'whatsapp_message_tracker',
        'receiver_url',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'receiver_number',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'whatsapp_message_tracker',
        'sender_number',
        {
          transaction,
        },
      );

      await queryInterface.removeColumn(
        'whatsapp_message_tracker',
        'sender_url',
        {
          transaction,
        },
      );

      await queryInterface.removeColumn(
        'whatsapp_message_tracker',
        'receiver_number',
        {
          transaction,
        },
      );

      await queryInterface.removeColumn(
        'whatsapp_message_tracker',
        'receiver_url',
        {
          transaction,
        },
      );
    });
  },
};
