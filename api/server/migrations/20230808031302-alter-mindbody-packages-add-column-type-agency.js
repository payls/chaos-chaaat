'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'mindbody_packages',
        'source_type',
        {
          type: Sequelize.TEXT,
          allowNull: false,
          after: 'name',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'mindbody_packages',
        'agency_fk',
        {
          type: Sequelize.TEXT,
          allowNull: false,
          after: 'mindbody_package_id',
        },
        { transaction },
      );

      await queryInterface.changeColumn(
        'mindbody_packages',
        'payload',
        {
          type: Sequelize.TEXT('long'),
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('mindbody_packages', 'source_type', {
        transaction,
      });

      await queryInterface.removeColumn('mindbody_packages', 'agency_fk', {
        transaction,
      });

      await queryInterface.changeColumn(
        'mindbody_packages',
        'payload',
        {
          type: Sequelize.TEXT,
        },
        { transaction },
      );
    });
  },
};
