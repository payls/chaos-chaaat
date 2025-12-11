'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('live_chat', {
      live_chat_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      agency_fk: {
        type: Sequelize.STRING,
      },
      contact_fk: {
        type: Sequelize.STRING,
      },
      agency_user_fk: {
        type: Sequelize.STRING,
      },
      session_id: {
        type: Sequelize.STRING,
      },
      msg_body: {
        type: Sequelize.TEXT,
      },
      msg_type: {
        type: Sequelize.STRING,
      },
      media_url: {
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
      caption: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reply_to_live_chat_id: {
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
      msg_timestamp: {
        type: Sequelize.INTEGER,
      },
      sender_number: {
        type: Sequelize.STRING,
      },
      receiver_number: {
        type: Sequelize.STRING,
      },
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
      replied: {
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
  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('live_chat');
  },
};
