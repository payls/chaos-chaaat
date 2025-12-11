'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('client_detail', {
      client_detail_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      crm_settings_fk: { type: Sequelize.UUID },
      contact_fk: { type: Sequelize.STRING },
      appointment_id: { type: Sequelize.STRING },
      client_id: { type: Sequelize.STRING }, // String // (eg: mindbody registered client id)
      email: { type: Sequelize.STRING },
      mobile_number: { type: Sequelize.STRING },
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
    return queryInterface.dropTable('client_detail');
  },
};
