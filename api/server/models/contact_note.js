'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class contact_note extends Model {
    static associate(models) {
      contact_note.belongsTo(models.agency_user, {
        foreignKey: 'agency_user_fk',
        targetKey: 'agency_user_id',
      });
    }
  }
  let fields = {
    contact_note_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    contact_fk: { type: DataTypes.UUID },
    agency_user_fk: { type: DataTypes.UUID },
    note: { type: DataTypes.TEXT },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  contact_note.init(fields, {
    sequelize,
    modelName: 'contact_note',
    freezeTableName: true,
    timestamps: false,
  });
  return contact_note;
};
