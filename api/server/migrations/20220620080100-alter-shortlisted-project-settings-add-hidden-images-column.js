'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'shortlisted_project_setting',
      'hidden_media',
      {
        type: Sequelize.TEXT,
        defaultValue: null,
        after: 'info_setting_education',
      },
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'shortlisted_project_setting',
        'hidden_media',
        {
          transaction,
        },
      );
    });
  },
};
