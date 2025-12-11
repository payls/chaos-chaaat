'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class currency extends Model {
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
    currency_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    currency_code: DataTypes.STRING,
    name: DataTypes.STRING,
    name_plural: DataTypes.STRING,
    symbol: DataTypes.STRING,
    symbol_native: DataTypes.STRING,
    decimal_digits: DataTypes.INTEGER,
    rounding: DataTypes.INTEGER,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  currency.init(fields, {
    sequelize,
    modelName: 'currency',
    freezeTableName: true,
    timestamps: false,
  });
  return currency;
};
