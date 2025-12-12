'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.renameColumn(
      'shortlisted_property',
      'bookmark',
      'is_bookmarked',
    );
  },

  down: async (queryInterface) => {
    await queryInterface.renameColumn(
      'shortlisted_property',
      'bookmark',
      'is_bookmarked',
    );
  },
};
