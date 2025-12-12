'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('user', 'is_whatsapp', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      after: 'mobile_number',
    });
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('user', 'is_whatsapp');
  },
};
