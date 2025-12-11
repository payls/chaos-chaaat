'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn('whatsapp_onboarding', 'webhook_url', {
        type: Sequelize.STRING,
        defaultValue: 'https://webhooks.chaaat.io/whatsapp/message/webhook',
      });
    });
  },

  down: async (queryInterface, Sequelize) => {},
};
