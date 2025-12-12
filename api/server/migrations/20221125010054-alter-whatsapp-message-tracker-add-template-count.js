'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'whatsapp_message_tracker',
      'template_count',
      {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        after: 'batch_count',
      },
    );
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn(
      'whatsapp_message_tracker',
      'template_count',
    );
  },
};
