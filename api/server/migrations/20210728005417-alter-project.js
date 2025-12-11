'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'project',
        'property_header_info_cover_picture_title',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'property_header_info_cover_picture_url',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'project',
        'property_header_info_cover_picture_filename',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'property_header_info_cover_picture_title',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'project',
        'property_header_info_cover_picture_title',
        { transaction },
      );
      await queryInterface.removeColumn(
        'project',
        'property_header_info_cover_picture_filename',
        { transaction },
      );
    });
  },
};
