'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('whatsapp_message_pricing', {
      whatsapp_message_pricing_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      market: {
        type: Sequelize.STRING,
      },
      currency: {
        type: Sequelize.STRING,
      },
      marketing: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      utility: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      authentication: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      service: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      created_by: {
        type: Sequelize.STRING,
      },
      created_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_by: {
        type: Sequelize.STRING,
      },
      updated_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        ),
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('whatsapp_message_pricing');
  },
};
