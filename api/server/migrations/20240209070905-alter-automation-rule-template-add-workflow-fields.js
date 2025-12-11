'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'automation_rule_template',
        'message_channel',
        {
          type: Sequelize.STRING,
          defaultValue: 'whatsapp',
          after: 'automation_rule_fk',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'automation_rule_template',
        'business_account',
        {
          type: Sequelize.STRING,
          defaultValue: null,
          allowNull: true,
          after: 'message_channel',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'automation_rule_template',
        'is_workflow',
        {
          type: Sequelize.STRING,
          defaultValue: false,
          allowNull: false,
          after: 'business_account',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'automation_rule_template',
        'message_flow_data',
        {
          type: Sequelize.TEXT('long'),
          defaultValue: null,
          allowNull: true,
          after: 'template_fk',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'automation_rule_template',
        'message_channel',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'automation_rule_template',
        'business_account',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'automation_rule_template',
        'is_workflow',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'automation_rule_template',
        'message_flow_data',
        {
          transaction,
        },
      );
    });
  },
};
