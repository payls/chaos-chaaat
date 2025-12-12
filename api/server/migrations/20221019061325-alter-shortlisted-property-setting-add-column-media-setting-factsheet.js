'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'shortlisted_property_setting',
        'media_setting_factsheet',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          after: 'media_setting_brocure',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'shortlisted_property_setting',
        'media_setting_factsheet',
        { transaction },
      );
    });
  },
};
