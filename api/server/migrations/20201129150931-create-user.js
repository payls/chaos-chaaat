'use strict';
const constant = require('../constants/constant.json');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user', {
      user_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      password: { type: Sequelize.TEXT },
      password_salt: { type: Sequelize.TEXT },
      first_name: { type: Sequelize.STRING },
      middle_name: { type: Sequelize.STRING },
      last_name: { type: Sequelize.STRING },
      email: { type: Sequelize.STRING },
      mobile_number: { type: Sequelize.STRING },
      date_of_birth: { type: Sequelize.STRING },
      gender: {
        allowNull: true,
        type: Sequelize.ENUM(Object.values(constant.USER.GENDER)),
      },
      nationality: { type: Sequelize.STRING },
      ordinarily_resident_location: { type: Sequelize.STRING },
      permanent_resident: { type: Sequelize.STRING },
      profile_picture_url: { type: Sequelize.TEXT },
      status: {
        allowNull: false,
        type: Sequelize.ENUM(Object.values(constant.USER.STATUS)),
        defaultValue: constant.USER.STATUS.ACTIVE,
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
    await queryInterface.dropTable('user');
  },
};
