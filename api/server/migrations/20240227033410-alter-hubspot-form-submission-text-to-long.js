'use strict';
const constant = require('../constants/constant.json');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn(
      'hubspot_form_submission_payload',
      'payload',
      {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },
    );
  },

  down: async (queryInterface, Sequelize) => {},
};
