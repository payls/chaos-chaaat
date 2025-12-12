'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('whatsapp_message_tracker', {
      whatsapp_message_tracker_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      tracker_ref_name: {
        type: Sequelize.STRING,
      },
      agency_fk: {
        type: Sequelize.UUID,
      },
      contact_fk: {
        type: Sequelize.UUID,
      },
      original_event_id: {
        type: Sequelize.STRING,
      },
      msg_id: {
        type: Sequelize.STRING,
      },
      msg_body: {
        type: Sequelize.TEXT,
      },
      pending: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      batch_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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
    await queryInterface.dropTable('whatsapp_message_tracker');
  },
};
