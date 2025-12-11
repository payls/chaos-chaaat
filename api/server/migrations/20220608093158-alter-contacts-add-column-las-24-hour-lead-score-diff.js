'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('contact', 'last_24_hour_lead_score_diff', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      after: 'last_48_hour_lead_score',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'contact',
        'last_24_hour_lead_score_diff',
        {
          transaction,
        },
      );
    });
  },
};
