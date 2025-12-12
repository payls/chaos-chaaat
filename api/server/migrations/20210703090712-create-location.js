'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('location', {
      location_id: { allowNull: false, primaryKey: true, type: Sequelize.UUID },
      project_location_map_fk: { type: Sequelize.UUID },
      project_location_nearby_fk: { type: Sequelize.UUID },
      name: { type: Sequelize.STRING },
      address: { type: Sequelize.TEXT },
      lat: { type: Sequelize.DECIMAL(40, 20) },
      lng: { type: Sequelize.DECIMAL(40, 20) },
      google_map_url: { type: Sequelize.TEXT },
      created_by: { type: Sequelize.STRING },
      created_date: {
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_by: { type: Sequelize.STRING },
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
    await queryInterface.dropTable('location');
  },
};
