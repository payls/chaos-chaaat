'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'contact',
        'agent_email_preference',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          after: 'status',
          defaultValue: true,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'contact',
        'contact_email_preference',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          after: 'agent_email_preference',
          defaultValue: true,
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('contact', 'agent_email_preference', {
        transaction,
      });
      await queryInterface.removeColumn('contact', 'contact_email_preference', {
        transaction,
      });
    });
  },
};
