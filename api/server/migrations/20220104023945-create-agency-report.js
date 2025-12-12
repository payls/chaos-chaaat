'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('agency_report', {
      agency_report_id: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.UUID,
      },
      agency_fk: {
        type: Sequelize.UUID,
      },
      agency_user_fk: {
        type: Sequelize.UUID,
      },
      url: {
        type: Sequelize.STRING,
      },
      filename: {
        type: Sequelize.STRING,
      },
      from: {
        type: Sequelize.DATE,
      },
      to: {
        type: Sequelize.DATE,
      },
      created_by: { type: Sequelize.STRING },
      created_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_by: { type: Sequelize.STRING },
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
    await queryInterface.dropTable('agency_report');
  },
};
