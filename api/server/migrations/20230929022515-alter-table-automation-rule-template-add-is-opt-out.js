'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'automation_rule_template',
        'cta_1_opt_out',
        {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          after: 'trigger_cta_1_options',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'automation_rule_template',
        'cta_2_opt_out',
        {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          after: 'trigger_cta_2_options',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'automation_rule_template',
        'cta_3_opt_out',
        {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          after: 'trigger_cta_3_options',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'automation_rule_template',
        'cta_1_opt_out',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'automation_rule_template',
        'cta_2_opt_out',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'automation_rule_template',
        'cta_3_opt_out',
        {
          transaction,
        },
      );
    });
  },
};
