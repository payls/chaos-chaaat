'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('contact_activity', 'activity_ip', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'activity_meta',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('contact_activity', 'activity_ip');
  },
};
