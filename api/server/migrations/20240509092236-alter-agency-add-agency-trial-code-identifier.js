'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'agency',
        'trial_code',
        {
          type: Sequelize.STRING(10),
          allowNull: true,
          defaultValue: null,
          after: 'default_outsider_contact_owner',
        },
        { transaction },
      );
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('agency', 'trial_code', {
        transaction,
      });
    });
  },
};
