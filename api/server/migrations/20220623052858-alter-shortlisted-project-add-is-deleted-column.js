'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('shortlisted_project', 'is_deleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      after: 'enquired_date',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('shortlisted_project', 'is_deleted', {
        transaction,
      });
    });
  },
};
