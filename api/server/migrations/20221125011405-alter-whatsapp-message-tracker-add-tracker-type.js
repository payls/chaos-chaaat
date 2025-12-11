'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'whatsapp_message_tracker',
      'tracker_type',
      {
        type: Sequelize.STRING,
        defaultValue: 'main',
        after: 'template_count',
      },
    );
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn(
      'whatsapp_message_tracker',
      'tracker_type',
    );
  },
};
