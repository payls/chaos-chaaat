'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('messenger_message_tracker', {
      messenger_message_tracker_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      campaign_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      campaign_name_label: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      tracker_ref_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      agency_fk: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      agency_user_fk: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      contact_fk: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      messenger_webhook_event_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      msg_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      msg_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      msg_origin: {
        type: Sequelize.STRING,
        defaultValue: 'user_message',
      },
      msg_body: {
        type: Sequelize.TEXT,
      },
      sender: { type: Sequelize.STRING },
      sender_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      receiver: { type: Sequelize.STRING },
      receiver_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      batch_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      template_count: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      tracker_type: {
        type: Sequelize.STRING,
        defaultValue: 'main',
      },
      pending: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
      msg_trigger: {
        type: Sequelize.STRING,
        defaultValue: 'user_message',
      },
      broadcast_date: {
        allowNull: true,
        type: 'TIMESTAMP',
      },
      visible: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      created_by: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_by: {
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.dropTable('messenger_message_tracker');
  },
};
