'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.renameColumn(
      'contact',
      'general_enquiry',
      'is_general_enquiry',
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.renameColumn(
      'contact',
      'is_general_enquiry',
      'general_enquiry',
    );
  },
};
