'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class user_email_verification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user_email_verification.belongsTo(models.user, {
        foreignKey: 'user_fk',
        targetKey: 'user_id',
      });
    }
  }
  let fields = {
    user_email_verification_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    user_fk: DataTypes.UUID,
    token: DataTypes.TEXT,
    verified_date: DataTypes.DATE,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  user_email_verification.init(fields, {
    sequelize,
    modelName: 'user_email_verification',
    freezeTableName: true,
    timestamps: false,
  });
  return user_email_verification;
};
