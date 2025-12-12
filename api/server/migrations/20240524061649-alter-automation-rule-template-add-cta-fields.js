'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'automation_rule_template',
        'cta_1',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'message_flow_data',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'automation_rule_template',
        'cta_2',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_1_option_type',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'automation_rule_template',
        'cta_3',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_2_option_type',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'automation_rule_template',
        'cta_4',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_3_option_type',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'automation_rule_template',
        'cta_5',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'cta_4_option_type',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {},
};
