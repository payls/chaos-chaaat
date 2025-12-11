'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'waba_template',
        'variable_identifier',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          defaultValue: null,
          after: 'header_image',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'waba_template',
        'variable_identifier',
        {
          transaction,
        },
      );
    });
  },
};
