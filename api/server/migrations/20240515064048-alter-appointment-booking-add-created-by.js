'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('appointment_booking', 'created_by', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'timezone',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('appointment_booking', 'created_by', {
        transaction,
      });
    });
  },
};
