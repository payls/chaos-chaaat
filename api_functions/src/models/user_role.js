'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class user_role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user_role.belongsTo(models.user, {
        foreignKey: 'user_fk',
        targetKey: 'user_id',
      });
    }
  }
  let fields = {
    user_role_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    user_fk: DataTypes.STRING,
    user_role: DataTypes.STRING,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  user_role.init(fields, {
    sequelize,
    modelName: 'user_role',
    freezeTableName: true,
    timestamps: false,
  });
  return user_role;
};
