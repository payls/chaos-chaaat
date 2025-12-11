'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const constant = require('../constants/constant.json');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class user_access_token extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user_access_token.belongsTo(models.user, {
        foreignKey: 'user_fk',
        targetKey: 'user_id',
      });
    }
  }
  let fields = {
    user_access_token_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    user_fk: DataTypes.UUID,
    access_token: DataTypes.TEXT,
    type: {
      type: DataTypes.ENUM(Object.values(constant.USER.ACCESS_TOKEN.TYPE)),
    },
    status: {
      type: DataTypes.ENUM(Object.values(constant.USER.ACCESS_TOKEN.STATUS)),
    },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  user_access_token.init(fields, {
    sequelize,
    modelName: 'user_access_token',
    freezeTableName: true,
    timestamps: false,
  });
  return user_access_token;
};
