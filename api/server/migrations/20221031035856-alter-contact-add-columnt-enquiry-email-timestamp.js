'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('contact', 'enquiry_email_timestamp', {
      type: Sequelize.STRING,
      after: 'lead_status_last_update',
    });
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('contact', 'enquiry_email_timestamp');
  },
};
