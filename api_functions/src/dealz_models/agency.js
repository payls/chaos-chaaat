'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
const constant = require('../constants/dealz.constant.json');
module.exports = (sequelize, DataTypes) => {
  class agency extends Model {
    static associate() {}
  }
  let fields = {
    agency_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_name: { type: DataTypes.STRING },
    agency_type: { type: DataTypes.STRING },
    agency_logo: { type: DataTypes.STRING },
    stripe_customer_id: { type: DataTypes.STRING },
    status: {
      allowNull: false,
      type: DataTypes.ENUM(Object.values(constant.AGENCY.STATUS)),
      defaultValue: constant.AGENCY.STATUS.INACTIVE,
    },
    created_by: { type: DataTypes.STRING },
    updated_by: { type: DataTypes.STRING },
  };
  fields = h.database.attachNoCreatedByAndUpdatedByModelDefinition(
    fields,
    DataTypes,
    this,
  );
  agency.init(fields, {
    sequelize,
    modelName: 'agency',
    freezeTableName: true,
    timestamps: false,
  });
  return agency;
};
