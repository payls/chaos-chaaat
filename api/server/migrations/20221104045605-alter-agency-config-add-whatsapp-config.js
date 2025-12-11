'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('agency_config', 'whatsapp_config', {
      type: Sequelize.TEXT,
      after: 'pave_config',
    });
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('agency_config', 'whatsapp_config');
  },
};
