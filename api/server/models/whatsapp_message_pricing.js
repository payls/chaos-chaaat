'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class whatsapp_message_pricing extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      // define association here
    }
  }
  let fields = {
    whatsapp_message_pricing_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    market: { type: DataTypes.STRING },
    currency: { type: DataTypes.STRING },
    template_name: { type: DataTypes.STRING },
    marketing: { type: DataTypes.DOUBLE },
    utility: { type: DataTypes.DOUBLE },
    authentication: { type: DataTypes.DOUBLE },
    authentication_intl: { type: DataTypes.DOUBLE },
    service: { type: DataTypes.DOUBLE },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  whatsapp_message_pricing.init(fields, {
    sequelize,
    modelName: 'whatsapp_message_pricing',
    freezeTableName: true,
    timestamps: false,
  });

  return whatsapp_message_pricing;
};
