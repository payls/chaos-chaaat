'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'automation_rule_trigger',
        'platform',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'MINDBODY',
          after: 'description',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('automation_rule_trigger', 'platform', {
        transaction,
      });
    });
  },
};
