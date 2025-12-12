'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('whatsapp_message_tracker', 'visible', {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      after: 'broadcast_date',
    });
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('whatsapp_message_tracker', 'visible');
  },
};
