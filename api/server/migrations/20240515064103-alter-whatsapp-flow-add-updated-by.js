'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('whatsapp_flow', 'updated_by', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'created_by',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('whatsapp_flow', 'updated_by', {
        transaction,
      });
    });
  },
};
