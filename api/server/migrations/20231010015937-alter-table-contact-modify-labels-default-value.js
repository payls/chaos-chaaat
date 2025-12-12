'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'contact',
        'labels',
        {
          type: Sequelize.STRING,
          defaultValue: null,
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'contact',
        'labels',
        {
          type: Sequelize.STRING,
          defaultValue: null,
        },
        { transaction },
      );
    });
  },
};
