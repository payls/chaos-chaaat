'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('crm_settings', 'crm_timeslot_settings', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'updated_by',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'crm_settings',
        'crm_timeslot_settings',
        {
          transaction,
        },
      );
    });
  },
};
