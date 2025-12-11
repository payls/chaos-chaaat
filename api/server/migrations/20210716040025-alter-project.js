'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'project',
        'size_format',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'currency_code',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'project',
        'completion_date',
        {
          type: Sequelize.DATE,
          allowNull: true,
          after: 'size_format',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('project', 'size_format', {
        transaction,
      });
      await queryInterface.removeColumn('project', 'completion_date', {
        transaction,
      });
    });
  },
};
