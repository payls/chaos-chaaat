'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('unified_inbox', {
      unified_inbox_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      tracker_id: {
        type: Sequelize.UUID,
      },
      tracker_ref_name: {
        type: Sequelize.STRING,
      },
      campaign_name: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      agency_fk: {
        type: Sequelize.UUID,
      },
      contact_fk: {
        type: Sequelize.UUID,
      },
      agency_user_fk: {
        type: Sequelize.UUID,
      },
      event_id: {
        type: Sequelize.STRING,
      },
      msg_platform: {
        type: Sequelize.STRING,
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
      msg_body: {
        type: Sequelize.TEXT,
      },
      msg_type: {
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
    await queryInterface.dropTable('unified_inbox');
  },
};
