'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('messenger_chat', {
      messenger_chat_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      campaign_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      agency_fk: {
        type: Sequelize.UUID,
      },
      agency_user_fk: {
        type: Sequelize.UUID,
      },
      contact_fk: {
        type: Sequelize.UUID,
      },
      messenger_webhook_event_fk: {
        type: Sequelize.STRING,
      },
      msg_id: {
        type: Sequelize.STRING,
      },
      msg_type: {
        type: Sequelize.STRING,
      },
      msg_body: {
        type: Sequelize.TEXT,
      },
      media_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      media_msg_id: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      content_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      file_name: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reply_to_event_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      reply_to_content: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reply_to_msg_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      reply_to_file_name: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reply_to_contact_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      caption: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      msg_origin: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'user_message',
      },
      msg_timestamp: { type: Sequelize.INTEGER },
      sender: { type: Sequelize.STRING },
      sender_url: { type: Sequelize.STRING },
      receiver: { type: Sequelize.STRING },
      receiver_url: { type: Sequelize.STRING },
      sent: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      delivered: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      failed: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      read: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_by: {
        type: Sequelize.STRING,
      },
      created_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_by: {
        type: Sequelize.STRING,
      },
      updated_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        ),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('messenger_chat');
  },
};
