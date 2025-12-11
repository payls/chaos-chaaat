'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'contact',
        'messenger_id',
        {
          type: Sequelize.STRING,
          defaultValue: false,
          allowNull: false,
          after: 'opt_out_line_date',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'contact',
        'opt_out_messenger',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
          after: 'messenger_id',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'contact',
        'opt_out_messenger_date',
        {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
          after: 'opt_out_messenger',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('contact', 'messenger_id', {
        transaction,
      });
      await queryInterface.removeColumn('contact', 'opt_out_messenger', {
        transaction,
      });
      await queryInterface.removeColumn('contact', 'opt_out_messenger_date', {
        transaction,
      });
    });
  },
};
