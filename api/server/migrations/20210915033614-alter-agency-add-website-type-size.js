'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'agency',
        'agency_website',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'agency_logo_url',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'agency',
        'agency_type',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'agency_website',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'agency',
        'agency_size',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'agency_type',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('agency', 'agency_website', {
        transaction,
      });
      await queryInterface.removeColumn('agency', 'agency_type', {
        transaction,
      });
      await queryInterface.removeColumn('agency', 'agency_size', {
        transaction,
      });
    });
  },
};
