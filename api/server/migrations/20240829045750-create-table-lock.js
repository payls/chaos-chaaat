'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('lock', {
      lock_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      process_name: {
        type: Sequelize.STRING,
      },
      entity_id: {
        type: Sequelize.STRING,
      },
      created_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        ),
      },
    });
    await queryInterface.addConstraint('lock', {
      fields: ['process_name', 'entity_id'],
      type: 'unique',
      name: 'unique_processName_entityId', // Optional: name the constraint
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('lock');
  },
};
