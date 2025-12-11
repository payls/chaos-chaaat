'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('task_message', 'user_fk', {
      type: Sequelize.UUID,
      allowNull: false,
      after: 'task_fk',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('task_message', 'user_fk');
  },
};
