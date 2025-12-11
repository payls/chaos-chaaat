'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'shortlisted_property',
      'is_general_enquiry',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        after: 'is_requested_for_reservation',
      },
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'shortlisted_property',
        'is_general_enquiry',
        {
          transaction,
        },
      );
    });
  },
};
