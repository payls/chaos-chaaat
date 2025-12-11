'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('project_media', 'display_order', {
      type: Sequelize.INTEGER,
      after: 'is_hero_image',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('project_media', 'display_order');
  },
};
