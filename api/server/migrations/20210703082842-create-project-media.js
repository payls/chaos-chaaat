'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('project_media', {
      project_media_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      project_fk: { type: Sequelize.UUID },
      type: { type: Sequelize.STRING },
      url: { type: Sequelize.TEXT },
      header_text: { type: Sequelize.STRING },
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
    await queryInterface.dropTable('project_media');
  },
};
