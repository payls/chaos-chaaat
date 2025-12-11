'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class contact_list extends Model {
    static associate(models) {
      contact_list.hasMany(models.contact_list_user, {
        foreignKey: 'contact_list_id',
        targetKey: 'contact_list_id',
      });

      contact_list.hasOne(models.contact_list_user, {
        foreignKey: 'contact_list_id',
        targetKey: 'contact_list_id',
        as: 'contact_count',
      });
    }
  }
  let fields = {
    contact_list_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    list_name: { type: DataTypes.STRING },
    user_count: { type: DataTypes.INTEGER },
    list_type: { type: DataTypes.STRING },
    list_property_name: { type: DataTypes.STRING },
    list_property_value: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING },
    agency_fk: { type: DataTypes.UUID },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  contact_list.init(fields, {
    sequelize,
    modelName: 'contact_list',
    freezeTableName: true,
    timestamps: false,
  });
  return contact_list;
};
