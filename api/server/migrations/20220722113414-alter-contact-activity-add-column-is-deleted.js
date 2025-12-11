'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('contact_activity', 'is_deleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      after: 'activity_date',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('contact_activity', 'is_deleted', {
        transaction,
      });
    });
  },
};
