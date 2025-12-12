'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    // TODO: change default to 1 later
    return queryInterface.addColumn('agency', 'agency_subscription_fk', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 5,
      after: 'agency_website',
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return queryInterface.removeColumn('agency', 'agency_subscription_fk');
  },
};
