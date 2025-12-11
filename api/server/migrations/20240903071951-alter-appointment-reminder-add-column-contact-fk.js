'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'appointment_reminder',
        'contact_fk',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'node_id',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('appointment_reminder', 'contact_fk', {
        transaction,
      });
    });
  },
};
