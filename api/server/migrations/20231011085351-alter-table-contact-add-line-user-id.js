'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'contact',
        'line_user_id',
        {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null,
          after: 'mobile_number',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('contact', 'line_user_id', {
        transaction,
      });
    });
  },
};
