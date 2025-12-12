'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'whatsapp_chat',
        'media_url',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'msg_body',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'whatsapp_chat',
        'content_type',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'media_url',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'whatsapp_chat',
        'file_name',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'content_type',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'whatsapp_chat',
        'caption',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'file_name',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'whatsapp_chat',
        'reply_to_event_id',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'caption',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'whatsapp_chat',
        'reply_to_content',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'reply_to_event_id',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'whatsapp_chat',
        'reply_to_contact_id',
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
      await queryInterface.removeColumn('whatsapp_chat', 'media_url', {
        transaction,
      });
      await queryInterface.removeColumn('whatsapp_chat', 'content_type', {
        transaction,
      });
      await queryInterface.removeColumn('whatsapp_chat', 'file_name', {
        transaction,
      });
      await queryInterface.removeColumn('whatsapp_chat', 'caption', {
        transaction,
      });
      await queryInterface.removeColumn('whatsapp_chat', 'reply_to_event_id', {
        transaction,
      });
      await queryInterface.removeColumn('whatsapp_chat', 'reply_to_content', {
        transaction,
      });
      await queryInterface.removeColumn(
        'whatsapp_chat',
        'reply_to_contact_id',
        {
          transaction,
        },
      );
    });
  },
};
