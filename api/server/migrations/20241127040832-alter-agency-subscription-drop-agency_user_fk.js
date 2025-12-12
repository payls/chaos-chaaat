'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('agency_subscription', 'agency_user_fk');
  },

  down: async (queryInterface, Sequelize) => {},
};
