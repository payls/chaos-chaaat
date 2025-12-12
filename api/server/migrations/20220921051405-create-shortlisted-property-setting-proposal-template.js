'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'shortlisted_property_setting_proposal_template',
      {
        shortlisted_property_setting_proposal_template_id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
        },
        shortlisted_project_setting_proposal_template_fk: {
          type: Sequelize.UUID,
        },
        shortlisted_property_proposal_template_fk: {
          type: Sequelize.UUID,
        },
        media_setting_image: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        media_setting_video: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        media_setting_floor_plan: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        media_setting_brocure: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        hidden_media: {
          type: Sequelize.TEXT,
          defaultValue: null,
        },
        media_order: {
          type: Sequelize.TEXT,
          defaultValue: null,
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
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(
      'shortlisted_property_setting_proposal_template',
    );
  },
};
