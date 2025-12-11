'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('line_follower', {
      line_follower_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      agency_fk: {
        type: Sequelize.UUID,
      },
      agency_channel_config_fk: {
        type: Sequelize.UUID,
      },
      contact_fk: {
        type: Sequelize.UUID,
      },
      line_user_fk: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'active',
      },
      created_by: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_by: {
        type: Sequelize.STRING,
        allowNull: true,
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('line_follower');
  },
};
