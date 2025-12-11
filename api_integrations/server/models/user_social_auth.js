'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const constant = require('../constants/constant.json');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class user_social_auth extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user_social_auth.belongsTo(models.user, {
        foreignKey: 'user_fk',
        targetKey: 'user_id',
      });
    }
  }
  let fields = {
    user_social_auth_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    user_fk: DataTypes.UUID,
    auth_type: { type: DataTypes.ENUM(Object.values(constant.USER.AUTH_TYPE)) },
    auth_data: DataTypes.TEXT,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  user_social_auth.init(fields, {
    sequelize,
    modelName: 'user_social_auth',
    freezeTableName: true,
    timestamps: false,
  });
  return user_social_auth;
};
