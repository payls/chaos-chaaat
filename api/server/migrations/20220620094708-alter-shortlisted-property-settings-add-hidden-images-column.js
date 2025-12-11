'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'shortlisted_property_setting',
      'hidden_media',
      {
        type: Sequelize.TEXT,
        defaultValue: null,
        after: 'media_setting_brocure',
      },
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'shortlisted_property_setting',
        'hidden_media',
        {
          transaction,
        },
      );
    });
  },
};
