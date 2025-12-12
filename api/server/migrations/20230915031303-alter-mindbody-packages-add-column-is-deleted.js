'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'mindbody_packages',
        'is_deleted',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          after: 'payload',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('mindbody_packages', 'is_deleted', {
        transaction,
      });
    });
  },
};
