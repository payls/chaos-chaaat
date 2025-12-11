'use strict';
const Constant = require('../constants/constant.json');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_social_auth', {
      user_social_auth_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      user_fk: {
        type: Sequelize.UUID,
      },
      auth_type: {
        allowNull: false,
        type: Sequelize.ENUM(Object.values(Constant.USER.AUTH_TYPE)),
      },
      auth_data: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('user_social_auth');
  },
};
