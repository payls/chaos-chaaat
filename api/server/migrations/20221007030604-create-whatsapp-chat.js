'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('whatsapp_chat', {
      whatsapp_chat_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      agency_fk: {
        type: Sequelize.UUID,
      },
      contact_fk: {
        type: Sequelize.UUID,
      },
      msg_id: {
        type: Sequelize.STRING,
      },
      msg_body: {
        type: Sequelize.TEXT,
      },
      msg_type: {
        type: Sequelize.STRING,
      },
      original_event_id: {
        type: Sequelize.STRING,
      },
      msg_timestamp: { type: Sequelize.INTEGER },
      sender_number: { type: Sequelize.STRING },
      sender_url: { type: Sequelize.STRING },
      receiver_number: { type: Sequelize.STRING },
      receiver_url: { type: Sequelize.STRING },
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
    await queryInterface.dropTable('whatsapp_chat');
  },
};
