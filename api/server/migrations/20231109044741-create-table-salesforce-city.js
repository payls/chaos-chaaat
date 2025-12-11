'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('agency_salesforce_city', {
      agency_salesforce_city_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      agency_fk: {
        type: Sequelize.UUID,
      },
      sf_city_id: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      language: {
        type: Sequelize.STRING,
      },
      created_by: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_by: {
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.dropTable('agency_salesforce_city');
  },
};
