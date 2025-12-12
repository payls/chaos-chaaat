'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'project_property',
        'number_of_bathroom',
        { type: Sequelize.DECIMAL(10, 1) },
        { transaction },
      );

      await queryInterface.changeColumn(
        'project_property',
        'number_of_bedroom',
        { type: Sequelize.DECIMAL(10, 1) },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'project_property',
        'number_of_bedroom',
        { type: Sequelize.INTEGER },
        { transaction },
      );

      await queryInterface.changeColumn(
        'project_property',
        'number_of_bathroom',
        { type: Sequelize.INTEGER },
        { transaction },
      );
    });
  },
};
