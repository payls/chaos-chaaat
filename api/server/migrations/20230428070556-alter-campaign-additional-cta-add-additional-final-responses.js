'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'campaign_additional_cta',
        'final_response_body_2',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'final_response_body',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'campaign_additional_cta',
        'final_response_body_3',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'final_response_body_2',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'campaign_additional_cta',
        'closing_response_body',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          after: 'final_response_body_3',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        'campaign_additional_cta',
        'final_response_body_2',
        {
          transaction,
        },
      );

      await queryInterface.removeColumn(
        'campaign_additional_cta',
        'final_response_body_3',
        {
          transaction,
        },
      );

      await queryInterface.removeColumn(
        'campaign_additional_cta',
        'closing_response_body',
        {
          transaction,
        },
      );
    });
  },
};
