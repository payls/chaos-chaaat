'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('stripe_checkout_session', {
      stripe_checkout_session_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      agency_fk: {
        type: Sequelize.STRING,
      },
      paid: {
        type: Sequelize.STRING,
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
    return queryInterface.dropTable('stripe_checkout_session');
  },
};
