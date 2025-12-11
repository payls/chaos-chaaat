'use strict';
const constant = require('../constants/constant.json');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('agency_subscription_product', {
      agency_subscription_product_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      agency_subscription_fk: {
        type: Sequelize.UUID,
      },
      stripe_product_id: {
        type: Sequelize.STRING,
      },
      subscription_data: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        defaultValue: null,
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
    return queryInterface.dropTable('agency_subscription_product');
  },
};
