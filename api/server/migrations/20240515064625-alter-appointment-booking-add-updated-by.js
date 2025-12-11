'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('appointment_booking', 'updated_by', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'created_by',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('appointment_booking', 'updated_by', {
        transaction,
      });
    });
  },
};
