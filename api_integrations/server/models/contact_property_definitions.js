'use strict';

const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
const constant = require('../constants/constant.json');

module.exports = (sequelize, DataTypes) => {
  class contact_property_definitions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      contact_property_definitions.belongsTo(models.agency_user, {
        foreignKey: 'agency_user_fk',
        targetKey: 'agency_user_id',
      });
      contact_property_definitions.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });
      contact_property_definitions.hasMany(models.contact_property_values, {
        foreignKey: 'contact_property_definition_fk',
      });
    }
  }

  let fields = {
    contact_property_definition_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_user_fk: { type: DataTypes.UUID },
    agency_fk: { type: DataTypes.UUID },
    attribute_name: { type: DataTypes.STRING },
    attribute_type: { type: DataTypes.STRING },
    attribute_source: { type: DataTypes.STRING },
    status: {
      type: DataTypes.ENUM(
        Object.values(constant.CONTACT.PROPERTY_DEFINITIONS.STATUS),
      ),
      defaultValue: constant.CONTACT.PROPERTY_DEFINITIONS.STATUS.ACTIVE,
    },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  contact_property_definitions.init(fields, {
    sequelize,
    modelName: 'contact_property_definitions',
    freezeTableName: true,
    timestamps: false,
  });
  return contact_property_definitions;
};
