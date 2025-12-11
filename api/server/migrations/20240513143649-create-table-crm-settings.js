'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('crm_settings', {
      crm_settings_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      agency_fk: { type: Sequelize.STRING },
      whatsapp_flow_fk: { type: Sequelize.STRING },
      agency_oauth_fk: { type: Sequelize.STRING },
      automation_rule_template_fk: { type: Sequelize.STRING },
      channel_type: { type: Sequelize.STRING },
      crm_type: { type: Sequelize.TEXT }, // SFDC, GCALENDAR, OUTLOOK, MINDBODY, HUBSPOT
      screens_data: { type: Sequelize.STRING },
      created_by: { type: Sequelize.STRING },
      created_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        ),
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('crm_settings');
  },
};
