'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('agency_oauth', 'crm_timeslot_settings', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'webhook_info',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'agency_oauth',
        'crm_timeslot_settings',
        {
          transaction,
        },
      );
    });
  },
};
