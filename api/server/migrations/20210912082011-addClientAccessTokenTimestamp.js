'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'integrations_access_keys',
        'client_access_token_expires_in',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          after: 'client_access_token',
        },
      );
      return Promise.resolve();
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'integrations_access_keys',
        'client_access_token_expires_in',
      );
      return Promise.resolve();
    });
  },
};
