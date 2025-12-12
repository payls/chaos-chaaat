'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn('campaign_cta', 'cta_1', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      });
      await queryInterface.changeColumn('campaign_cta', 'cta_2', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      });
      await queryInterface.changeColumn('campaign_cta', 'cta_3', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      });
      await queryInterface.changeColumn('campaign_cta', 'cta_4', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      });
      await queryInterface.changeColumn('campaign_cta', 'cta_5', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      });
      await queryInterface.changeColumn('campaign_cta', 'cta_6', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      });
      await queryInterface.changeColumn('campaign_cta', 'cta_7', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      });
      await queryInterface.changeColumn('campaign_cta', 'cta_8', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      });
      await queryInterface.changeColumn('campaign_cta', 'cta_9', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      });
      await queryInterface.changeColumn('campaign_cta', 'cta_10', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      });
    });
  },

  down: async (queryInterface, Sequelize) => {},
};
