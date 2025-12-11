'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'contact',
        'opt_out_line',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
          after: 'line_user_id',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'contact',
        'opt_out_line_date',
        {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
          after: 'opt_out_line',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('contact', 'opt_out_line', {
        transaction,
      });
      await queryInterface.removeColumn('contact', 'opt_out_line_date', {
        transaction,
      });
    });
  },
};
