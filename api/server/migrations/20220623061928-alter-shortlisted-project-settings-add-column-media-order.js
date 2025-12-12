'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'shortlisted_project_setting',
      'media_order',
      {
        type: Sequelize.TEXT,
        defaultValue: null,
        after: 'hidden_media',
      },
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'shortlisted_project_setting',
        'media_order',
        {
          transaction,
        },
      );
    });
  },
};
