'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      'shortlisted_property_comment_attachment',
      {
        shortlisted_property_comment_attachment_id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
        },
        shortlisted_property_comment_fk: { type: Sequelize.UUID },
        attachment_url: { type: Sequelize.TEXT },
        attachment_title: { type: Sequelize.STRING },
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
      },
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('shortlisted_property_comment_attachment');
  },
};
