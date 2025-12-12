'use strict';
const constant = require('../constants/constant.json');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chaaat_product_matrix', {
      chaaat_product_matrix_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      product_name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      product_price: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      allowed_channels: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      allowed_users: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      allowed_contacts: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      allowed_campaigns: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      allowed_automations: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      allowed_outgoing_messages: {
        type: Sequelize.STRING,
        allowNull: true,
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

  async down(queryInterface) {
    await queryInterface.dropTable('chaaat_product_matrix');
  },
};
