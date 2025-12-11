'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('shortlisted_property', 'is_deleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      after: 'is_general_enquiry',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('shortlisted_property', 'is_deleted', {
        transaction,
      });
    });
  },
};
