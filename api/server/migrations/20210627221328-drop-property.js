'use strict';
const constant = require('../constants/constant.json');
module.exports = {
  up: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('property', { transaction });
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'property',
        {
          property_id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
          },
          project_fk: { type: Sequelize.UUID },
          currency_code: { type: Sequelize.STRING },
          code: { type: Sequelize.STRING },
          address_1: { type: Sequelize.STRING },
          address_2: { type: Sequelize.STRING },
          address_3: { type: Sequelize.STRING },
          unit_number: { type: Sequelize.STRING },
          floor_number: { type: Sequelize.STRING },
          direction_facing: {
            type: Sequelize.ENUM(Object.values(constant.DIRECTION)),
          },
          area_sqm: { type: Sequelize.DOUBLE },
          area_sqft: { type: Sequelize.DOUBLE },
          offer_price: { type: Sequelize.DOUBLE },
          no_of_bedrooms: { type: Sequelize.INTEGER },
          no_of_bathrooms: { type: Sequelize.INTEGER },
          has_balcony: { type: Sequelize.INTEGER },
          notes: { type: Sequelize.TEXT },
          status: {
            type: Sequelize.ENUM(Object.values(constant.PROPERTY.STATUS)),
          },
          is_deleted: {
            allowNull: false,
            type: Sequelize.INTEGER,
            defaultValue: 0,
          },
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
        },
        { transaction },
      );
    });
  },
};
