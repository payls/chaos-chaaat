'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('hubspot_form_submission_payload', {
      hubspot_form_submission_payload_id: {
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
      hubspot_form_fk: {
        type: Sequelize.STRING,
      },
      payload: {
        type: Sequelize.TEXT,
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: 'create',
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
    return queryInterface.dropTable('hubspot_form_submission_payload');
  },
};
