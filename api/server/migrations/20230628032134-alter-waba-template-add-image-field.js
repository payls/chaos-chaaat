'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'waba_template',
        'header_image',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          defaultValue: null,
          after: 'content',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('waba_template', 'header_image', {
        transaction,
      });
    });
  },
};
