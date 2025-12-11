'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sms_message_tracker', {
      sms_message_tracker_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
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
      webhook_access_key: {
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
      sms_msg_sid: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      msg_body: {
        type: Sequelize.TEXT,
      },
      account_sid: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sender_number: { type: Sequelize.STRING },
      sender_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      receiver_number: { type: Sequelize.STRING },
      receiver_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      delivered: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      failed: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      msg_trigger: {
        type: Sequelize.STRING,
        defaultValue: 'proposal',
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
    await queryInterface.dropTable('sms_message_tracker');
  },
};
