'use strict';

const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class contact_property_values extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      contact_property_values.belongsTo(models.contact_property_definitions, {
        foreignKey: 'contact_property_definition_fk',
        targetKey: 'contact_property_definition_id',
      });

      contact_property_values.belongsTo(models.contact, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_id',
      });
    }
  }

  let fields = {
    contact_property_value_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    contact_fk: { type: DataTypes.UUID },
    contact_property_definition_fk: { type: DataTypes.UUID },
    attribute_value_int: { type: DataTypes.DOUBLE },
    attribute_value_string: { type: DataTypes.TEXT },
    attribute_value_date: { type: DataTypes.DATE },
    is_deleted: { type: DataTypes.BOOLEAN },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  contact_property_values.init(fields, {
    sequelize,
    modelName: 'contact_property_values',
    timestamps: false,
  });
  return contact_property_values;
};
