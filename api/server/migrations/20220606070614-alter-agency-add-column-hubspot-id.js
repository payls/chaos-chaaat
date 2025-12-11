'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('agency', 'hubspot_id', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'agency_subscription_fk',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('agency', 'hubspot_id', {
        transaction,
      });
    });
  },
};
