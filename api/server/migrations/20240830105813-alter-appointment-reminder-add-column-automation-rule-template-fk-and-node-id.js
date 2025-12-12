'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'appointment_reminder',
        'automation_rule_template_fk',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'appointment_reminder_id',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'appointment_reminder',
        'node_id',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'reminder_time',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'appointment_reminder',
        'automation_rule_template_fk',
        { transaction },
      );
      await queryInterface.removeColumn('appointment_reminder', 'node_id', {
        transaction,
      });
    });
  },
};
