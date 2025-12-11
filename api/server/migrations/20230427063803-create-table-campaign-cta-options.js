'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('campaign_cta_options', {
      campaign_cta_option_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      tracker_ref_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      response_trigger: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      response_body: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      response_options: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      second_response_body: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      second_response_options: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      final_response_body: {
        type: Sequelize.TEXT,
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
    return queryInterface.dropTable('campaign_cta_options');
  },
};
