'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('contact_activity', {
      contact_activity_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      contact_fk: { type: Sequelize.UUID },
      activity_type: { type: Sequelize.STRING },
      activity_meta: { type: Sequelize.TEXT },
      activity_date: { type: Sequelize.DATE },
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
    await queryInterface.dropTable('contact_activity');
  },
};
