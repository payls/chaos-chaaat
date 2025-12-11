'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'automation_rule_template',
        'cta_1_response',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'template_fk',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'automation_rule_template',
        'trigger_cta_1_options',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_1_response',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'automation_rule_template',
        'cta_2_response',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'trigger_cta_1_options',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'automation_rule_template',
        'trigger_cta_2_options',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_2_response',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'automation_rule_template',
        'cta_3_response',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'trigger_cta_2_options',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'automation_rule_template',
        'trigger_cta_3_options',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_3_response',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'automation_rule_template',
        'cta_1_response',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'automation_rule_template',
        'trigger_cta_1_options',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'automation_rule_template',
        'cta_2_response',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'automation_rule_template',
        'trigger_cta_2_options',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'automation_rule_template',
        'cta_3_response',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'automation_rule_template',
        'trigger_cta_3_options',
        {
          transaction,
        },
      );
    });
  },
};
