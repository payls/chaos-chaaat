'use strict';
const constant = require('../constants/constant.json');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('agency_notification', {
      agency_notification_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      agency_fk: {
        type: Sequelize.UUID,
      },
      agency_subscription_fk: {
        type: Sequelize.UUID,
        allowNull: true,
        defaultValue: null,
      },
      notification_type: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      notification_subject: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      message: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
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
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('agency_notification');
  },
};
