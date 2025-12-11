'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cron_job', {
      cron_job_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      type: {
        type: Sequelize.STRING,
      },
      payload: {
        type: Sequelize.TEXT,
      },
      num_try: {
        type: Sequelize.INTEGER.UNSIGNED,
        defaultValue: 0,
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('cron_job');
  },
};
