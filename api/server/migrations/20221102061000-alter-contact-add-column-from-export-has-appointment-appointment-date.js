'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'contact',
        'from_export',
        {
          type: Sequelize.BOOLEAN,
          after: 'enquiry_email_timestamp',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'contact',
        'has_appointment',
        {
          type: Sequelize.BOOLEAN,
          after: 'from_export',
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'contact',
        'appointment_date',
        {
          type: Sequelize.DATE,
          after: 'has_appointment',
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('contact', 'from_export', {
        transaction,
      });

      await queryInterface.removeColumn('contact', 'has_appointment', {
        transaction,
      });

      await queryInterface.removeColumn('contact', 'appointment_date', {
        transaction,
      });
    });
  },
};
