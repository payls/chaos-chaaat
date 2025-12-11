'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('crm_settings', 'whatsapp_flow_fk', {
        transaction,
      });
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.addColumn('crm_settings', 'whatsapp_flow_fk', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'agency_fk',
    });
  },
};
