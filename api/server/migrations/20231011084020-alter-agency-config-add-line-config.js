'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('agency_config', 'line_config', {
      type: Sequelize.TEXT,
      after: 'sms_config',
    });
  },
  down: async (queryInterface) => {
    return queryInterface.removeColumn('agency_config', 'line_config');
  },
};
