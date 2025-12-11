'use strict';
const Constant = require('../constants/constant.json');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('developer_user', {
      developer_user_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      developer_fk: { type: Sequelize.UUID },
      user_fk: { type: Sequelize.UUID },
      status: {
        allowNull: false,
        type: Sequelize.ENUM(Object.values(Constant.DEVELOPER.USER.STATUS)),
        defaultValue: Constant.DEVELOPER.USER.STATUS.ACTIVE,
      },
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('developer_user');
  },
};
