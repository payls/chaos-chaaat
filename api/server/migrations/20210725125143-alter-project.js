'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn(
      'project',
      'property_header_info_cover_picture_url',
      { type: Sequelize.TEXT },
    );
  },

  down: async (queryInterface, Sequelize) => {},
};
