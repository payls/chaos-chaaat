'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'contact',
        'company',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'mobile_number',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'contact',
        'title',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'company',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'contact',
        'lead_source',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'last_24_hour_lead_score_diff',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'contact',
        'priority',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'permalink_template',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'contact',
        'subscriber_status',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'buy_status',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'contact',
        'manual_label',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'subscriber_status',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('contact', 'company', {
        transaction,
      });

      await queryInterface.removeColumn('contact', 'title', {
        transaction,
      });

      await queryInterface.removeColumn('contact', 'lead_source', {
        transaction,
      });

      await queryInterface.removeColumn('contact', 'priority', {
        transaction,
      });

      await queryInterface.removeColumn('contact', 'subscriber_status', {
        transaction,
      });

      await queryInterface.removeColumn('contact', 'manual_label', {
        transaction,
      });
    });
  },
};
