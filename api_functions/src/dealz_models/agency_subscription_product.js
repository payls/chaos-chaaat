'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class agency_subscription_product extends Model {
    static associate() {}
  }
  let fields = {
    agency_subscription_product_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_subscription_fk: { type: DataTypes.UUID },
    stripe_product_id: { type: DataTypes.STRING },
    product_name: { type: DataTypes.STRING },
    allowed_slot: { type: DataTypes.INTEGER },
    banner_image: { type: DataTypes.INTEGER },
    weekly_dealz: { type: DataTypes.INTEGER },
    weekly_banner_dealz: { type: DataTypes.INTEGER },
  };
  fields = h.database.attachNoCreatedByAndUpdatedByModelDefinition(
    fields,
    DataTypes,
    this,
  );
  agency_subscription_product.init(fields, {
    sequelize,
    modelName: 'agency_subscription_product',
    freezeTableName: true,
    timestamps: false,
  });
  return agency_subscription_product;
};
