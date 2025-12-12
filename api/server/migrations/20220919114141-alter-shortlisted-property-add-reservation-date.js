'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'shortlisted_property',
      'reservation_date',
      {
        type: Sequelize.DATE,
        allowNull: true,
        after: 'is_requested_for_reservation',
      },
    );
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn(
      'shortlisted_property',
      'reservation_date',
    );
  },
};
