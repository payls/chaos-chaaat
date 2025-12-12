'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'waba_template',
        'is_draft',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          after: 'header_image',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('waba_template', 'is_draft', {
        transaction,
      });
    });
  },
};
