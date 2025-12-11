'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addIndex(
        'agency_user_chat_read_status',
        ['chat_type', 'agency_user_fk'],
        {
          name: 'idx_chat_type_agency_user_fk',
        },
      );
      await queryInterface.addIndex(
        'agency_user_chat_read_status',
        ['chat_id', 'chat_type', 'agency_user_fk'],
        {
          name: 'idx_chat_id_chat_type_agency_user_fk',
        },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface().removeIndex(
        'agency_user_chat_read_status',
        'idx_chat_type_agency_user_fk',
      );
      await queryInterface().removeIndex(
        'agency_user_chat_read_status',
        'idx_chat_id_chat_type_agency_user_fk',
      );
    });
  },
};
