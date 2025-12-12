'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'project_media',
        'filename',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'url',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('project_media', 'filename', {
        transaction,
      });
    });
  },
};
