'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class dealz extends Model {
    static associate() {}
  }
  let fields = {
    dealz_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.UUID },
    title: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    offer_type: { type: DataTypes.STRING },
    amount: { type: DataTypes.DECIMAL(10, 2) },
    coupon_creation_type: { type: DataTypes.STRING },
    coupon_code_type: { type: DataTypes.STRING },
    link: { type: DataTypes.STRING },
    slot_date: { type: DataTypes.DATE },
    slot_time: { type: DataTypes.STRING },
    valid_date_from: { type: DataTypes.DATE },
    valid_date_to: { type: DataTypes.DATE },
    initial_message: { type: DataTypes.TEXT },
    followup_message: { type: DataTypes.TEXT },
    banner_image: { type: DataTypes.TEXT },
    daily_deal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    weekly_deal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reach_count: { type: DataTypes.INTEGER },
    weight: { type: DataTypes.INTEGER },
    status: { type: DataTypes.STRING },
    created_by: { type: DataTypes.STRING },
    updated_by: { type: DataTypes.STRING },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes, this);
  dealz.init(fields, {
    sequelize,
    modelName: 'dealz',
    freezeTableName: true,
    timestamps: false,
  });
  return dealz;
};
