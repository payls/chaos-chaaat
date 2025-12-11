'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class agency_subscription_product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      agency_subscription_product.belongsTo(models.agency_subscription, {
        foreignKey: 'agency_subscription_fk',
      });
    }
  }
  let fields = {
    agency_subscription_product_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_subscription_fk: { type: DataTypes.UUID },
    stripe_product_id: { type: DataTypes.STRING },
    subscription_data: { type: DataTypes.TEXT },
    product_name: { type: DataTypes.STRING },
    allowed_channels: { type: DataTypes.STRING },
    allowed_users: { type: DataTypes.STRING },
    allowed_contacts: { type: DataTypes.STRING },
    allowed_campaigns: { type: DataTypes.STRING },
    allowed_automations: { type: DataTypes.STRING },
    allowed_outgoing_messages: { type: DataTypes.STRING },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  agency_subscription_product.init(fields, {
    sequelize,
    modelName: 'agency_subscription_product',
    freezeTableName: true,
    timestamps: false,
  });
  return agency_subscription_product;
};
