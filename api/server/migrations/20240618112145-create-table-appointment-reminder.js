'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('appointment_reminder', {
      appointment_reminder_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      reminder_type: { type: Sequelize.STRING },
      time_unit: { type: Sequelize.STRING },
      time_unit_number_val: { type: Sequelize.STRING },
      status: { type: Sequelize.STRING },
      whatsapp_flow_fk: { type: Sequelize.UUID },
      agency_user_fk: { type: Sequelize.UUID },
      appointment_booking_fk: { type: Sequelize.UUID },
      reminder_time: { type: Sequelize.DATE },
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

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable('appointment_reminder');
  },
};
