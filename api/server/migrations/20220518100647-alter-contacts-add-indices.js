'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('contact', ['first_name']);

    await queryInterface.addIndex('contact', ['last_name']);

    await queryInterface.addIndex('contact', ['email']);

    await queryInterface.addIndex('contact', ['mobile_number']);

    await queryInterface.addIndex('contact', ['agency_fk']);

    await queryInterface.addIndex('contact', ['agency_user_fk']);

    await queryInterface.addIndex('contact', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('contact', ['first_name']);

    await queryInterface.removeIndex('contact', ['last_name']);

    await queryInterface.removeIndex('contact', ['email']);

    await queryInterface.removeIndex('contact', ['mobile_number']);

    await queryInterface.removeIndex('contact', ['agency_fk']);

    await queryInterface.removeIndex('contact', ['agency_user_fk']);

    await queryInterface.removeIndex('contact', ['status']);
  },
};
