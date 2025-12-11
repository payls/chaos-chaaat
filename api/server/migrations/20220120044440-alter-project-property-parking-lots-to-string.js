'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn(
      'project_property',
      'number_of_parking_lots',
      { type: Sequelize.STRING },
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn(
      'project_property',
      'number_of_parking_lots',
      { type: Sequelize.INTEGER },
    );
  },
};
