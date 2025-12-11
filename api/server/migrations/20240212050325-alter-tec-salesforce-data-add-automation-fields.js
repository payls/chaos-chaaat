'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'tec_salesforce_data',
        'campaign_cta_id',
        {
          type: Sequelize.STRING,
          defaultValue: null,
          allowNull: true,
          after: 'contact_fk',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'tec_salesforce_data',
        'data_synced',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: true,
          after: 'tnc_agree',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'tec_salesforce_data',
        'campaign_cta_id',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn('tec_salesforce_data', 'data_synced', {
        transaction,
      });
    });
  },
};
