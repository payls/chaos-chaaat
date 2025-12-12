'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'contact',
        'opt_out_whatsapp',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
          after: 'is_whatsapp',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'contact',
        'opt_out_sms',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
          after: 'opt_out_whatsapp',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('contact', 'opt_out_whatsapp', {
        transaction,
      });
      await queryInterface.removeColumn('contact', 'opt_out_sms', {
        transaction,
      });
    });
  },
};
