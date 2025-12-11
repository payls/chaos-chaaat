'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('contact_email_communication', {
      contact_email_communication_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      contact_fk: {
        type: Sequelize.UUID,
      },
      agency_user_fk: {
        type: Sequelize.UUID,
      },
      email_subject: {
        type: Sequelize.TEXT,
      },
      email_body: {
        type: Sequelize.TEXT,
      },
      email_meta: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('contact_email_communication');
  },
};
