'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('crm_settings', 'updated_by', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'created_by',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('crm_settings', 'updated_by', {
        transaction,
      });
    });
  },
};
