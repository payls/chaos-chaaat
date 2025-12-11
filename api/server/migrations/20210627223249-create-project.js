'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('project', {
      project_id: { allowNull: false, primaryKey: true, type: Sequelize.UUID },
      name: { type: Sequelize.STRING },
      description: { type: Sequelize.TEXT },
      currency_code: Sequelize.STRING,
      location_address_1: { type: Sequelize.STRING },
      location_address_2: { type: Sequelize.STRING },
      location_address_3: { type: Sequelize.STRING },
      location_latitude: { type: Sequelize.DECIMAL(40, 20) },
      location_longitude: { type: Sequelize.DECIMAL(40, 20) },
      location_google_map_url: { type: Sequelize.TEXT },
      status: { type: Sequelize.STRING },
      is_deleted: { type: Sequelize.INTEGER },
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
    await queryInterface.dropTable('project');
  },
};
