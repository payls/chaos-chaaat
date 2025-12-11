'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'contact_salesforce_data',
        'tnc_date',
        {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
          after: 'tnc_agree',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('contact_salesforce_data', 'tnc_date', {
        transaction,
      });
    });
  },
};
