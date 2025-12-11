'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'project',
        'key_stats',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          defaultValue: null,
          after: 'description',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'project',
        'project_highlights',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          defaultValue: null,
          after: 'key_stats',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'project',
        'why_invest',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          defaultValue: null,
          after: 'project_highlights',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'project',
        'shopping',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          defaultValue: null,
          after: 'why_invest',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'project',
        'transport',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          defaultValue: null,
          after: 'shopping',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'project',
        'education',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          defaultValue: null,
          after: 'transport',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('project', 'key_stats', {
        transaction,
      });
      await queryInterface.removeColumn('project', 'project_highlights', {
        transaction,
      });
      await queryInterface.removeColumn('project', 'why_invest', {
        transaction,
      });
      await queryInterface.removeColumn('project', 'shopping', {
        transaction,
      });
      await queryInterface.removeColumn('project', 'transport', {
        transaction,
      });
      await queryInterface.removeColumn('project', 'education', {
        transaction,
      });
    });
  },
};
