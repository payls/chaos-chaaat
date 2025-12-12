'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_email_verification', {
      user_email_verification_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      user_fk: {
        type: Sequelize.UUID,
      },
      token: {
        type: Sequelize.TEXT,
      },
      verified_date: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('user_email_verification');
  },
};
