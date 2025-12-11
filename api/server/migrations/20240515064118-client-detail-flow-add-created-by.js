'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('client_detail', 'created_by', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'mobile_number',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('client_detail', 'created_by', {
        transaction,
      });
    });
  },
};
