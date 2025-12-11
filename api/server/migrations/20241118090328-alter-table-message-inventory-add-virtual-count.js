'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Add the new column
    await queryInterface.addColumn('message_inventory', 'virtual_count', {
      type: Sequelize.INTEGER,
      defaultValue: 0, // This is for new rows
      allowNull: false, // Ensures no null values are allowed
      after: 'message_count', // MySQL only: adds column after 'message_count'
    });

    // Step 2: Update existing rows to set `virtual_count` equal to `message_count`
    await queryInterface.sequelize.query(`
      UPDATE message_inventory 
      SET virtual_count = message_count
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the column in the `down` method
    await queryInterface.removeColumn('message_inventory', 'virtual_count');
  },
};
