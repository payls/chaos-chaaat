'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('contact_property_values', {
      contact_property_value_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      contact_fk: { type: Sequelize.UUID },
      contact_property_definition_fk: { type: Sequelize.UUID },
      attribute_value_int: { type: Sequelize.DOUBLE },
      attribute_value_string: { type: Sequelize.TEXT },
      attribute_value_date: { type: 'TIMESTAMP' },
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
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('contact_property_values');
  },
};
