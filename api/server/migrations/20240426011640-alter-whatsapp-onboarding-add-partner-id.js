'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'whatsapp_onboarding',
        'partner_id',
        {
          type: Sequelize.STRING,
          defaultValue: 'PID-63294842a3760900125c7e1c',
          after: 'agency_fk',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('whatsapp_onboarding', 'partner_id', {
        transaction,
      });
    });
  },
};
