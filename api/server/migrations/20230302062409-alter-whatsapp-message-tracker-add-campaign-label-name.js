'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'whatsapp_message_tracker',
      'campaign_name_label',
      {
        type: Sequelize.TEXT,
        defaultValue: null,
        after: 'campaign_name',
      },
    );
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn(
      'whatsapp_message_tracker',
      'campaign_name_label',
    );
  },
};
