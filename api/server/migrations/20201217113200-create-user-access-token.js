'use strict';
const constant = require('../constants/constant.json');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_access_token', {
      user_access_token_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      user_fk: {
        type: Sequelize.UUID,
      },
      access_token: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      type: {
        allowNull: false,
        type: Sequelize.ENUM(Object.values(constant.USER.ACCESS_TOKEN.TYPE)),
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM(Object.values(constant.USER.ACCESS_TOKEN.STATUS)),
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
    await queryInterface.dropTable('user_access_token');
  },
};
