'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('contact', 'is_agency_sms_connection', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      after: 'opt_out_whatsapp',
    });
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('contact', 'is_agency_sms_connection');
  },
};
