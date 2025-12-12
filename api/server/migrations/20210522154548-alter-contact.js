'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('contact', 'agency_user_fk', {
      type: Sequelize.UUID,
      allowNull: true,
      after: 'agency_fk',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('contact', 'agency_user_fk');
  },
};
