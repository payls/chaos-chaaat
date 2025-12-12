'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'whatsapp_chat',
        'msg_template_id',
        {
          type: Sequelize.UUID,
          allowNull: true,
          after: 'msg_info',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'whatsapp_chat',
        'msg_category',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'msg_template_id',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {},
};
