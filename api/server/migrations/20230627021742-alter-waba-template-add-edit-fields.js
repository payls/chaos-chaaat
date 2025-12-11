'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'waba_template',
        'is_edited',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          after: 'visible',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'waba_template',
        'last_edit_date',
        {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
          after: 'is_edited',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('waba_template', 'is_edited', {
        transaction,
      });
      await queryInterface.removeColumn('waba_template', 'last_edit_date', {
        transaction,
      });
    });
  },
};
