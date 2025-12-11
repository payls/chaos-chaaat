'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class leads extends Model {}
  let fields = {
    lead_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    email: { type: DataTypes.STRING },
    mobile: { type: DataTypes.STRING },
    source: { type: DataTypes.STRING },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  leads.init(fields, {
    sequelize,
    modelName: 'leads',
    freezeTableName: true,
    timestamps: false,
  });
  return leads;
};
