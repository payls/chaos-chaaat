'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.renameColumn(
        'tec_salesforce_data',
        'tec_salesforce_data_id',
        'contact_salesforce_data_id',
      );
      await queryInterface.renameTable(
        'tec_salesforce_data',
        'contact_salesforce_data',
      );
    });
  },

  down: async (queryInterface, Sequelize) => {},
};
