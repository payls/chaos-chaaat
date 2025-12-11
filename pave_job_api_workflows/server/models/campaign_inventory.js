'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
const constant = require('../constants/constant.json');

module.exports = (sequelize, DataTypes) => {
  class campaign_inventory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  let fields = {
    campaign_inventory_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: DataTypes.UUID,
    agency_subscription_fk: DataTypes.UUID,
    period_from: { type: DataTypes.DATE },
    period_to: { type: DataTypes.DATE },
    campaign_count: DataTypes.INTEGER,
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  campaign_inventory.init(fields, {
    sequelize,
    modelName: 'campaign_inventory',
    freezeTableName: true,
    timestamps: false,
  });

  return campaign_inventory;
};
