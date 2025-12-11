'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('user', 'buyer_type', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'profile_picture_url',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('user', 'buyer_type');
  },
};
