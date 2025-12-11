'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addIndex(
        'unified_inbox',
        ['agency_fk', 'tracker_type'],
        {
          name: 'idx_inbox_agency_tracker',
        },
      );
      await queryInterface.addIndex(
        'unified_inbox',
        ['agency_fk', 'tracker_type', 'agency_user_fk'],
        {
          name: 'idx_inbox_agency_tracker_agent',
        },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface().removeIndex(
        'unified_inbox',
        'idx_inbox_agency_tracker',
      );
      await queryInterface().removeIndex(
        'unified_inbox',
        'idx_inbox_agency_tracker_agent',
      );
    });
  },
};
