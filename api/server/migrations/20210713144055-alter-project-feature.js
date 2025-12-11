'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'project_feature',
        'feature_fk',
        {
          type: Sequelize.UUID,
          allowNull: false,
          after: 'project_fk',
        },
        { transaction },
      );
      await queryInterface.removeColumn('project_feature', 'name', {
        transaction,
      });
      await queryInterface.removeColumn('project_feature', 'type', {
        transaction,
      });
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('project_feature', 'feature_fk', {
        transaction,
      });
      await queryInterface.addColumn(
        'project_feature',
        'name',
        { type: Sequelize.STRING, after: 'project_fk' },
        { transaction },
      );
      await queryInterface.addColumn(
        'project_feature',
        'type',
        { type: Sequelize.STRING, after: 'name' },
        { transaction },
      );
    });
  },
};
