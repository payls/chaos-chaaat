'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'automation_rule',
        'workflow_timeout_count',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 48,
          after: 'rule_trigger_setting_count',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'automation_rule',
        'workflow_timeout_type',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'hours',
          after: 'rule_trigger_setting_count',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'automation_rule',
        'workflow_timeout_count',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'automation_rule',
        'workflow_timeout_type',
        {
          transaction,
        },
      );
    });
  },
};
