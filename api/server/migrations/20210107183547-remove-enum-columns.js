'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.changeColumn('user', 'gender', {
      type: Sequelize.STRING,
    });
    await queryInterface.changeColumn('user', 'status', {
      type: Sequelize.STRING,
    });
    await queryInterface.changeColumn('user_role', 'user_role', {
      type: Sequelize.STRING,
    });
    await queryInterface.changeColumn('user_access_token', 'type', {
      type: Sequelize.STRING,
    });
    await queryInterface.changeColumn('user_access_token', 'status', {
      type: Sequelize.STRING,
    });
    await queryInterface.changeColumn('user_social_auth', 'auth_type', {
      type: Sequelize.STRING,
    });
    await queryInterface.changeColumn('developer', 'status', {
      type: Sequelize.STRING,
    });
    await queryInterface.changeColumn('developer_user', 'status', {
      type: Sequelize.STRING,
    });
    await queryInterface.changeColumn('project', 'status', {
      type: Sequelize.STRING,
    });
    await queryInterface.changeColumn('property', 'direction_facing', {
      type: Sequelize.STRING,
    });
    await queryInterface.changeColumn('property', 'status', {
      type: Sequelize.STRING,
    });
    await queryInterface.changeColumn('property_transaction', 'status', {
      type: Sequelize.STRING,
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
