'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'project_property',
        'unit_number',
        {
          type: Sequelize.STRING,
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'project_property',
        'unit_number',
        {
          type: Sequelize.INTEGER,
        },
        { transaction },
      );
    });
  },
};
