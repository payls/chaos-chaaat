'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('agency', 'is_paid', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      after: 'agency_type',
      defaultValue: 1,
    });
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('agency', 'is_paid');
  },
};
