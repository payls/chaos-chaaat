'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('mindbody_packages', {
      mindbody_package_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      package_id: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      payload: {
        type: Sequelize.TEXT,
      },
      created_by: {
        type: Sequelize.STRING,
      },
      created_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_by: {
        type: Sequelize.STRING,
      },
      updated_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        ),
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('mindbody_packages');
  },
};
