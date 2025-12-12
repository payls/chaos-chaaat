'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class chaaat_product_matrix extends Model {
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
    chaaat_product_matrix_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    product_name: { type: DataTypes.STRING },
    product_price: { type: DataTypes.STRING },
    allowed_channels: { type: DataTypes.STRING },
    allowed_users: { type: DataTypes.STRING },
    allowed_contacts: { type: DataTypes.STRING },
    allowed_campaigns: { type: DataTypes.STRING },
    allowed_automations: { type: DataTypes.STRING },
    allowed_outgoing_messages: { type: DataTypes.STRING },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  chaaat_product_matrix.init(fields, {
    sequelize,
    modelName: 'chaaat_product_matrix',
    freezeTableName: true,
    timestamps: false,
  });
  return chaaat_product_matrix;
};
