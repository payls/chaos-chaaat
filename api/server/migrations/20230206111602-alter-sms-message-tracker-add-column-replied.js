'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('sms_message_tracker', 'replied', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      after: 'failed',
    });
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('sms_message_tracker', 'replied');
  },
};
