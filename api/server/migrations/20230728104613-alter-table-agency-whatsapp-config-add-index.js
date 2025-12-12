'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addIndex('agency_whatsapp_config', ['waba_number'], {
        name: 'idx_waba_number',
      });
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface().removeIndex(
        'agency_whatsapp_config',
        'idx_waba_number',
      );
    });
  },
};
