'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'landing_page_info',
        'meta_title',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'landing_page_css',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'landing_page_info',
        'meta_description',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'landing_page_css',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'landing_page_info',
        'meta_image',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'landing_page_css',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('landing_page_info', 'meta_title', {
        transaction,
      });

      await queryInterface.removeColumn(
        'landing_page_info',
        'meta_description',
        {
          transaction,
        },
      );

      await queryInterface.removeColumn('landing_page_info', 'meta_image', {
        transaction,
      });
    });
  },
};
