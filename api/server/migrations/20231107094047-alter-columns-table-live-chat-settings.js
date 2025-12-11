'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'live_chat_settings',
        'chat_start_time',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.changeColumn(
        'live_chat_settings',
        'chat_end_time',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'live_chat_settings',
        'chat_start_time',
        {
          type: Sequelize.STRING,
          allowNull: false,
        },
        { transaction },
      );
      await queryInterface.changeColumn(
        'live_chat_settings',
        'chat_end_time',
        {
          type: Sequelize.STRING,
          allowNull: false,
        },
        { transaction },
      );
    });
  },
};
