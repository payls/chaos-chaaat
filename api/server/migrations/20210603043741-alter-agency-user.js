'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'agency_user',
        'description',
        { type: Sequelize.TEXT, allowNull: true, after: 'agency_fk' },
        { transaction },
      );
      await queryInterface.addColumn(
        'agency_user',
        'year_started',
        { type: Sequelize.INTEGER, allowNull: true, after: 'description' },
        { transaction },
      );
      await queryInterface.addColumn(
        'agency_user',
        'website',
        { type: Sequelize.TEXT, allowNull: true, after: 'year_started' },
        { transaction },
      );
      await queryInterface.addColumn(
        'agency_user',
        'instagram',
        { type: Sequelize.TEXT, allowNull: true, after: 'website' },
        { transaction },
      );
      await queryInterface.addColumn(
        'agency_user',
        'linkedin',
        { type: Sequelize.TEXT, allowNull: true, after: 'instagram' },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('agency_user', 'description', {
        transaction,
      });
      await queryInterface.removeColumn('agency_user', 'year_started', {
        transaction,
      });
      await queryInterface.removeColumn('agency_user', 'website', {
        transaction,
      });
      await queryInterface.removeColumn('agency_user', 'instagram', {
        transaction,
      });
      await queryInterface.removeColumn('agency_user', 'linkedin', {
        transaction,
      });
    });
  },
};
