'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('shortlisted_project_setting', {
      shortlisted_project_setting_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      shortlisted_project_fk: {
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
      info_setting_key_stats: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      info_setting_project_highlights: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      info_setting_why_invest: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      info_setting_shopping: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      info_setting_transport: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      info_setting_education: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.dropTable('shortlisted_project_setting');
  },
};
