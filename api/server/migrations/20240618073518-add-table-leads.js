'use strict';
const constant = require('../constants/constant.json');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('leads', {
      lead_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      source: {
        allowNull: false,
        type: Sequelize.ENUM(Object.values(constant.LEAD_SOURCE)), // widget_generator, google_ads
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mobile: {
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

  async down(queryInterface) {
    await queryInterface.dropTable('leads');
  },
};
