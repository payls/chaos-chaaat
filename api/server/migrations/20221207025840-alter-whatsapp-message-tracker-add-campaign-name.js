'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'whatsapp_message_tracker',
      'campaign_name',
      {
        type: Sequelize.TEXT,
        defaultValue: null,
        after: 'whatsapp_message_tracker_id',
      },
    );
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn(
      'whatsapp_message_tracker',
      'campaign_name',
    );
  },
};
