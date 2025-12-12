'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('shortlisted_project_proposal_template', {
      shortlisted_project_proposal_template_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      proposal_template_fk: { type: Sequelize.UUID },
      project_fk: {
        type: Sequelize.UUID,
      },
      display_order: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('shortlisted_project_proposal_template');
  },
};
