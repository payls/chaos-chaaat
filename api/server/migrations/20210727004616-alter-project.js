'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'project',
        'location_google_place_id',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'location_google_map_url',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'project',
        'location_google_place_raw',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'location_google_place_id',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('project', 'location_google_place_id', {
        transaction,
      });
      await queryInterface.removeColumn(
        'project',
        'location_google_place_raw',
        { transaction },
      );
    });
  },
};
