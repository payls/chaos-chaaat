'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'whatsapp_message_pricing',
        'authentication_intl',
        {
          type: Sequelize.DECIMAL(10, 4),
          allowNull: true,
          after: 'authentication',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {},
};
