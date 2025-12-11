'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
const constant = require('../constants/dealz.constant.json');
module.exports = (sequelize, DataTypes) => {
  class inventory extends Model {
    static associate() {
      // define association here
    }
  }
  let fields = {
    inventory_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.UUID },
    inventory_type: {
      type: DataTypes.ENUM(Object.values(constant.AGENCY.INVENTORY.TYPE)),
      defaultValue: constant.AGENCY.INVENTORY.TYPE.SUBSCRIPTION,
    },
    agency_subscription_product_fk: { type: DataTypes.UUID },
    item_type: {
      type: DataTypes.ENUM(Object.values(constant.AGENCY.INVENTORY.ITEM_TYPE)),
      defaultValue: constant.AGENCY.INVENTORY.ITEM_TYPE.SLOT,
    },
    period_start: { type: DataTypes.DATE },
    period_end: { type: DataTypes.DATE },
    inventory_count: { type: DataTypes.INTEGER },
    used_count: { type: DataTypes.INTEGER },
  };
  fields = h.database.attachNoCreatedByAndUpdatedByModelDefinition(
    fields,
    DataTypes,
    this,
  );
  inventory.init(fields, {
    sequelize,
    modelName: 'inventory',
    freezeTableName: true,
    timestamps: false,
  });
  return inventory;
};
