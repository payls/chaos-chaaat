'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('appointment_booking', {
      appointment_booking_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      crm_settings_fk: { type: Sequelize.STRING },
      appointment_id: { type: Sequelize.STRING },
      appointment_type: { type: Sequelize.STRING },
      appointment_link: { type: Sequelize.STRING },
      initial_booking_message: { type: Sequelize.STRING },
      initial_message_cta: { type: Sequelize.STRING },
      start_time: { type: Sequelize.DATE },
      end_time: { type: Sequelize.DATE },
      timezone: { type: Sequelize.STRING },
      created_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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
    return queryInterface.dropTable('appointment_booking');
  },
};
