'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'agency',
        'default_outsider_contact_owner',
        {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null,
          after: 'agency_campaign_additional_recipient',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'agency',
        'default_outsider_contact_owner',
        {
          transaction,
        },
      );
    });
  },
};
