'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'contact',
        'permalink_template',
        {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: 'pave',
          after: 'permalink_last_opened',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('contact', 'permalink_template', {
        transaction,
      });
    });
  },
};
