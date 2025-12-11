'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn('campaign_cta', 'cta_1_response', {
        type: Sequelize.TEXT,
      });
      await queryInterface.changeColumn('campaign_cta', 'cta_2_response', {
        type: Sequelize.TEXT,
      });
      await queryInterface.changeColumn('campaign_cta', 'cta_3_response', {
        type: Sequelize.TEXT,
      });
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn('campaign_cta', 'cta_1_response', {
        type: Sequelize.STRING,
      });
      await queryInterface.changeColumn('campaign_cta', 'cta_2_response', {
        type: Sequelize.STRING,
      });
      await queryInterface.changeColumn('campaign_cta', 'cta_3_response', {
        type: Sequelize.STRING,
      });
    });
  },
};
