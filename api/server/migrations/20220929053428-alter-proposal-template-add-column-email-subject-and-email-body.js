'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'proposal_template',
        'email_subject',
        {
          type: Sequelize.TEXT,
          after: 'is_draft',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'proposal_template',
        'email_body',
        {
          type: Sequelize.TEXT,
          after: 'email_subject',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('proposal_template', 'email_subject', {
        transaction,
      });

      await queryInterface.removeColumn('proposal_template', 'email_body', {
        transaction,
      });
    });
  },
};
