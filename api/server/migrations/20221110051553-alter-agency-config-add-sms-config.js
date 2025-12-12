'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('agency_config', 'sms_config', {
      type: Sequelize.TEXT,
      after: 'whatsapp_config',
    });
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('agency_config', 'sms_config');
  },
};
