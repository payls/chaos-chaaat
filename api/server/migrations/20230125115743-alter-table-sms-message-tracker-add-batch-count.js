'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('sms_message_tracker', 'batch_count', {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      after: 'failed',
    });
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('sms_message_tracker', 'batch_count');
  },
};
