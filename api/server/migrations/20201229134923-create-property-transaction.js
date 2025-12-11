'use strict';
const constant = require('../constants/constant.json');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('property_transaction', {
      property_transaction_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      property_fk: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      transaction_price: { type: Sequelize.DOUBLE },
      has_reservation_fee: { type: Sequelize.INTEGER },
      reservation_fee: { type: Sequelize.DOUBLE },
      reservation_fee_percent: { type: Sequelize.DOUBLE },
      has_stamp_duty: { type: Sequelize.INTEGER },
      stamp_duty_local_percent: { type: Sequelize.DOUBLE },
      stamp_duty_foreigner_percent: { type: Sequelize.DOUBLE },
      land_tax_local: { type: Sequelize.DOUBLE },
      land_tax_foreigner: { type: Sequelize.DOUBLE },
      has_contract_fee: { type: Sequelize.INTEGER },
      contract_fee_due_date: { type: Sequelize.DATE },
      contract_fee_percent: { type: Sequelize.DOUBLE },
      final_payment_percent: { type: Sequelize.DOUBLE },
      settlement_date: { type: Sequelize.DATE },
      inspection_date: { type: Sequelize.DATE },
      legal_cost: { type: Sequelize.DOUBLE },
      is_conveyancing_done: { type: Sequelize.INTEGER },
      conveyancing_fee: { type: Sequelize.DOUBLE },
      status: {
        allowNull: false,
        type: Sequelize.ENUM(
          Object.values(constant.PROPERTY.TRANSACTION.STATUS),
        ),
        defaultValue: constant.PROPERTY.TRANSACTION.STATUS.PENDING,
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
    await queryInterface.dropTable('property_transaction');
  },
};
