'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'shortlisted_property_comment_attachment',
      'file_name',
      {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'attachment_title',
      },
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'shortlisted_property_comment_attachment',
      'file_name',
    );
  },
};
