'use strict';
const constant = require('../constants/constant.json');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'agency_whatsapp_config',
        'agency_whatsapp_api_token',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      );

      await queryInterface.changeColumn(
        'agency_whatsapp_config',
        'agency_whatsapp_api_secret',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {},
};
