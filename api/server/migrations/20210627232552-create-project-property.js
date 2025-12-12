'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('project_property', {
      project_property_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      project_fk: { type: Sequelize.UUID },
      unit_type: Sequelize.STRING,
      unit_number: Sequelize.INTEGER,
      floor: Sequelize.INTEGER,
      sqm: Sequelize.DECIMAL(20, 10),
      number_of_bedroom: Sequelize.INTEGER,
      number_of_bathroom: Sequelize.INTEGER,
      number_of_parking_lots: Sequelize.INTEGER,
      direction_facing: Sequelize.STRING,
      currency_code: Sequelize.STRING,
      starting_price: Sequelize.DECIMAL(40, 10),
      weekly_rent: Sequelize.DECIMAL(40, 10),
      rental_yield: Sequelize.DECIMAL(40, 10),
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
    await queryInterface.dropTable('project_property');
  },
};
