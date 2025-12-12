'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('shortlisted_project_comment', {
      shortlisted_project_comment_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      shortlisted_project_fk: { type: Sequelize.UUID },
      contact_fk: { type: Sequelize.UUID },
      agency_user_fk: { type: Sequelize.UUID },
      user_fk: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      contact_comment: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      message: { type: Sequelize.TEXT },
      comment_date: { type: Sequelize.DATE },
      parent_comment_fk: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      status: { type: Sequelize.STRING },
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

  async down(queryInterface) {
    await queryInterface.dropTable('shortlisted_project_comment');
  },
};
