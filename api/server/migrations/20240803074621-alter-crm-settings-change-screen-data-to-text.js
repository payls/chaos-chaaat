'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn('crm_settings', 'screens_data', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn('crm_settings', 'screens_data', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    });
  },
};
