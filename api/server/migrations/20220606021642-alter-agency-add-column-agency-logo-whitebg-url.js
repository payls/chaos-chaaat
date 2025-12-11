'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('agency', 'agency_logo_whitebg_url', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'agency_logo_url',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('agency', 'agency_logo_whitebg_url', {
        transaction,
      });
    });
  },
};
