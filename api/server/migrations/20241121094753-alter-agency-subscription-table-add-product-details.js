'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'agency_subscription',
        'subscription_name',
        {
          type: Sequelize.STRING,
          after: 'stripe_subscription_id',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'agency_subscription_product',
        'product_name',
        {
          type: Sequelize.STRING,
          after: 'stripe_product_id',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'agency_subscription_product',
        'allowed_channels',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'subscription_data',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'agency_subscription_product',
        'allowed_users',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'allowed_channels',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'agency_subscription_product',
        'allowed_contacts',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'allowed_users',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'agency_subscription_product',
        'allowed_campaigns',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'allowed_contacts',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'agency_subscription_product',
        'allowed_automations',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'allowed_campaigns',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'agency_subscription_product',
        'allowed_outgoing_messages',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'allowed_automations',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {},
};
