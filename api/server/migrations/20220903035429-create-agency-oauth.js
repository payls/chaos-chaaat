'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('agency_oauth', {
      agency_oauth_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      agency_fk: { type: Sequelize.UUID },
      status: { type: Sequelize.STRING },
      source: { type: Sequelize.STRING },
      access_info: { type: Sequelize.TEXT },
      webhook_info: { type: Sequelize.TEXT },
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
    await queryInterface.dropTable('agency_oauth');
  },
};
