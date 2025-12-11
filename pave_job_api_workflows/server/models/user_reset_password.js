'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class user_reset_password extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user_reset_password.belongsTo(models.user, {
        foreignKey: 'user_fk',
        targetKey: 'user_id',
      });
    }
  }
  let fields = {
    user_reset_password_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    user_fk: DataTypes.UUID,
    token: DataTypes.TEXT,
    reset_date: DataTypes.DATE,
    status: DataTypes.STRING, // USER.RESET_PASSWORD.STATYS
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  user_reset_password.init(fields, {
    sequelize,
    modelName: 'user_reset_password',
    freezeTableName: true,
    timestamps: false,
  });
  return user_reset_password;
};
