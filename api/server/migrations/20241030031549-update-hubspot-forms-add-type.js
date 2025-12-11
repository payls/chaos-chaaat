'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('hubspot_form', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'HUBSPOT',
      after: 'form_name',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('hubspot_form', 'type', {
        transaction,
      });
    });
  },
};
