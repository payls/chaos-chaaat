'use strict';
const Constant = require('../constants/constant.json');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('developer', {
      developer_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      name: { type: Sequelize.STRING },
      description: { type: Sequelize.STRING },
      logo_url: { type: Sequelize.STRING },
      status: {
        allowNull: false,
        type: Sequelize.ENUM(Object.values(Constant.DEVELOPER.STATUS)),
        defaultValue: Constant.DEVELOPER.STATUS.ACTIVE,
      },
      country: { type: Sequelize.STRING },
      established_date: { type: Sequelize.STRING },
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
    await queryInterface.dropTable('developer');
  },
};
