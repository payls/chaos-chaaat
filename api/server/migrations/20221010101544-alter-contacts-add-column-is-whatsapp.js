'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('contact', 'is_whatsapp', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      after: 'mobile_number',
    });
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('contact', 'is_whatsapp');
  },
};
