'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('project_media', 'is_hero_image', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: 'header_text',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('project_media', 'is_hero_image');
  },
};
