'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'agency',
        'agency_stripe_customer_id',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'agency_subscription_fk',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {},
};
