'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class stripe_invoice extends Model {}
  let fields = {
    stripe_invoice_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    status: { type: DataTypes.STRING },
    payload: { type: DataTypes.TEXT },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  stripe_invoice.init(fields, {
    sequelize,
    modelName: 'stripe_invoice',
    freezeTableName: true,
    timestamps: false,
  });

  return stripe_invoice;
};
