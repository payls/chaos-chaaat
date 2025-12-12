'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('campaign_cta', {
      campaign_cta_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      campaign_tracker_ref_name: {
        type: Sequelize.STRING,
      },
      cta_1: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cta_2: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cta_3: {
        type: Sequelize.STRING,
        allowNull: false,
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
    return queryInterface.dropTable('campaign_cta');
  },
};
