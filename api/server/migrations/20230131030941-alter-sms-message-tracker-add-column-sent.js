'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('sms_message_tracker', 'sent', {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      after: 'receiver_url',
    });
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('sms_message_tracker', 'sent');
  },
};
