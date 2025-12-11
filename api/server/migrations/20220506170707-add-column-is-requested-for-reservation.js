'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'shortlisted_property',
      'is_requested_for_reservation',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        after: 'bookmark_date',
      },
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'shortlisted_property',
        'is_requested_for_reservation',
        {
          transaction,
        },
      );
    });
  },
};
