'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('stripe_payment_intent', {
      stripe_payment_intent_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      status: {
        type: Sequelize.TEXT('long'),
      },
      payload: {
        type: Sequelize.TEXT('long'),
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

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable('stripe_payment_intent');
  },
};
