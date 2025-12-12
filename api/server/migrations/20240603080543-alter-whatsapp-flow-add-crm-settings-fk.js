'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('whatsapp_flow', 'crm_settings_fk', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'waba_template_fk',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('whatsapp_flow', 'crm_settings_fk', {
        transaction,
      });
    });
  },
};
