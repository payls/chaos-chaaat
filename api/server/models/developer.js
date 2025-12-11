'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
const constant = require('../constants/constant.json');
module.exports = (sequelize, DataTypes) => {
  class developer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      developer.hasMany(models.developer_user, { foreignKey: 'developer_fk' });
    }
  }
  let fields = {
    developer_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    logo_url: DataTypes.TEXT,
    status: {
      type: DataTypes.STRING,
      defaultValue: constant.DEVELOPER.STATUS.ACTIVE,
    },
    country: DataTypes.STRING,
    established_date: DataTypes.STRING,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  developer.init(fields, {
    sequelize,
    modelName: 'developer',
    freezeTableName: true,
    timestamps: false,
  });
  return developer;
};
