'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'whatsapp_onboarding',
        'pending_date',
        {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
          after: 'status',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'whatsapp_onboarding',
        'submitted_date',
        {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
          after: 'pending_date',
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'whatsapp_onboarding',
        'confirmed_date',
        {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
          after: 'submitted_date',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('whatsapp_onboarding', 'pending_date', {
        transaction,
      });
      await queryInterface.removeColumn(
        'whatsapp_onboarding',
        'submitted_date',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'whatsapp_onboarding',
        'confirmed_date',
        {
          transaction,
        },
      );
    });
  },
};
