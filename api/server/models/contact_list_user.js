'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class contact_list_user extends Model {
    static associate(models) {
      contact_list_user.belongsTo(models.contact, {
        foreignKey: 'contact_id',
        targetKey: 'contact_id',
      });
    }
  }
  let fields = {
    contact_list_user_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    contact_list_id: { type: DataTypes.STRING },
    contact_id: { type: DataTypes.STRING },
    import_type: { type: DataTypes.STRING },
    hubspot_id: { type: DataTypes.STRING },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  contact_list_user.init(fields, {
    sequelize,
    modelName: 'contact_list_user',
    freezeTableName: true,
    timestamps: false,
  });
  return contact_list_user;
};
