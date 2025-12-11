'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'contact',
        'last_24_hour_lead_score',
        {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          after: 'lead_score',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'contact',
        'last_48_hour_lead_score',
        {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          after: 'last_24_hour_lead_score',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('contact', 'last_24_hour_lead_score', {
        transaction,
      });

      await queryInterface.removeColumn('contact', 'last_48_hour_lead_score', {
        transaction,
      });
    });
  },
};
