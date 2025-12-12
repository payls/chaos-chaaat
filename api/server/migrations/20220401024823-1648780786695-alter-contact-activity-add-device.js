'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('contact_activity', 'viewed_on_device', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'activity_ip',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('contact_activity', 'viewed_on_device');
  },
};
