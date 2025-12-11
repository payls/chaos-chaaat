'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'contact',
        'status',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'agency_user_fk',
        },
        { transaction },
      );
      await queryInterface.sequelize.query(
        'UPDATE contact SET status = "active"',
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('contact', 'status');
  },
};
