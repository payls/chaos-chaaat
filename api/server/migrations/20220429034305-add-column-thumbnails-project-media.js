'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('project_media', 'thumbnail_src', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'url',
    });
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('project_media', 'thumbnail_src', {
        transaction,
      });
    });
  },
};
