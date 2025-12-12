'use strict';
const constant = require('../constants/constant.json');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('contact_property_definitions', {
      contact_property_definition_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      agency_user_fk: { type: Sequelize.UUID },
      agency_fk: { type: Sequelize.UUID },
      attribute_name: { type: Sequelize.STRING },
      attribute_type: { type: Sequelize.STRING },
      attribute_source: { type: Sequelize.STRING },
      status: {
        allowNull: false,
        type: Sequelize.ENUM(
          Object.values(constant.CONTACT.PROPERTY_DEFINITIONS.STATUS),
        ),
        defaultValue: constant.CONTACT.PROPERTY_DEFINITIONS.STATUS.ACTIVE,
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
    await queryInterface.dropTable('contact_property_definitions');
  },
};
