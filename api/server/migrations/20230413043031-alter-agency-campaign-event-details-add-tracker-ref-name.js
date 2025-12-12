'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'agency_campaign_event_details',
      'tracker_ref_name',
      {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'agency_fk',
      },
    );
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn(
      'agency_campaign_event_details',
      'tracker_ref_name',
    );
  },
};
