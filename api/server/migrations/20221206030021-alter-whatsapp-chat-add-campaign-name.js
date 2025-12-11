'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('whatsapp_chat', 'campaign_name', {
      type: Sequelize.TEXT,
      defaultValue: null,
      after: 'whatsapp_chat_id',
    });
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('whatsapp_chat', 'campaign_name');
  },
};
