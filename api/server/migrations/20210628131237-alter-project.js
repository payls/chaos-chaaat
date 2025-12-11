'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'project',
        'agency_fk',
        {
          type: Sequelize.UUID,
          allowNull: true,
          after: 'project_id',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('project', 'agency_fk', {
        transaction,
      });
    });
  },
};
