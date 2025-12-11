'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('task_message_attachment', {
      task_message_attachment_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      task_message_fk: { type: Sequelize.UUID },
      file_name: { type: Sequelize.TEXT },
      file_url: { type: Sequelize.TEXT },
      created_by: { type: Sequelize.STRING },
      created_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_by: { type: Sequelize.STRING },
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
    await queryInterface.dropTable('task_message_attachment');
  },
};
