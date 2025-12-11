'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('campaign_schedule', {
      campaign_schedule_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      campaign_source: {
        type: Sequelize.TEXT,
      },
      send_date: {
        allowNull: false,
        type: 'TIMESTAMP',
      },
      time_zone: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      triggered: {
        type: Sequelize.BOOLEAN,
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
  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('campaign_schedule');
  },
};
