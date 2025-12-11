'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'landing_page_info',
        'landing_page_data',
        {
          type: Sequelize.TEXT('long'),
        },
        { transaction },
      );

      await queryInterface.changeColumn(
        'landing_page_info',
        'landing_page_html',
        {
          type: Sequelize.TEXT('long'),
        },
        { transaction },
      );

      await queryInterface.changeColumn(
        'landing_page_info',
        'landing_page_css',
        {
          type: Sequelize.TEXT('long'),
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'landing_page_info',
        'landing_page_data',
        {
          type: Sequelize.TEXT,
        },
        { transaction },
      );

      await queryInterface.changeColumn(
        'landing_page_info',
        'landing_page_html',
        {
          type: Sequelize.TEXT,
        },
        { transaction },
      );

      await queryInterface.changeColumn(
        'landing_page_info',
        'landing_page_css',
        {
          type: Sequelize.TEXT,
        },
        { transaction },
      );
    });
  },
};
