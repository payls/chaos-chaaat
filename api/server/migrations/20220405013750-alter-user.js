'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('user', 'last_seen', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'buyer_type',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('user', 'last_seen');
  },
};
