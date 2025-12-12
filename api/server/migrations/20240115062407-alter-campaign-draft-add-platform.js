'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'campaign_draft',
        'platform',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'whatsapp',
          after: 'configuration',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('campaign_draft', 'platform', {
        transaction,
      });
    });
  },
};
