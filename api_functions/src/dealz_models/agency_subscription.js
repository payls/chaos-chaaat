'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
const constant = require('../constants/dealz.constant.json');
module.exports = (sequelize, DataTypes) => {
  class agency_subscription extends Model {
    static associate() {}
  }
  let fields = {
    agency_subscription_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.UUID },
    stripe_subscription_id: { type: DataTypes.STRING },
    subscription_name: { type: DataTypes.STRING },
    period_start: { type: DataTypes.DATE },
    period_end: { type: DataTypes.DATE },
    status: {
      type: DataTypes.ENUM(Object.values(constant.USER.SUBSCRIPTION.STATUS)),
      defaultValue: constant.USER.SUBSCRIPTION.STATUS.ACTIVE,
    },
  };
  fields = h.database.attachNoCreatedByAndUpdatedByModelDefinition(
    fields,
    DataTypes,
    this,
  );
  agency_subscription.init(fields, {
    sequelize,
    modelName: 'agency_subscription',
    freezeTableName: true,
    timestamps: false,
  });
  return agency_subscription;
};
