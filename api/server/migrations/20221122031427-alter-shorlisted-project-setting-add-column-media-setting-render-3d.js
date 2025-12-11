'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'shortlisted_project_setting',
        'media_setting_render_3d',
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
        'shortlisted_project_setting',
        'media_setting_render_3d',
        { transaction },
      );
    });
  },
};
