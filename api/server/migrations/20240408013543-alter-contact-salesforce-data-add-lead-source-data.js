'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'contact_salesforce_data',
        'lead_source',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'interested_city',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'contact_salesforce_data',
        'lead_source_lv1',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'lead_source',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'contact_salesforce_data',
        'lead_source_lv2',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'lead_source_lv1',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'contact_salesforce_data',
        'lead_source',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'contact_salesforce_data',
        'lead_source_lv1',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'contact_salesforce_data',
        'lead_source_lv2',
        {
          transaction,
        },
      );
    });
  },
};
