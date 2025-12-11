'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('whatsapp_flow', {
      whatsapp_flow_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      waba_template_fk: { type: Sequelize.STRING },
      flow_id: { type: Sequelize.STRING },
      flow_name: { type: Sequelize.STRING },
      flow_categories: { type: Sequelize.STRING },
      flow_payload: { type: Sequelize.TEXT },
      message: { type: Sequelize.STRING },
      button_text: { type: Sequelize.STRING },
      status: { type: Sequelize.STRING },
      preview_link: { type: Sequelize.STRING },
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
    return queryInterface.dropTable('whatsapp_flow');
  },
};
