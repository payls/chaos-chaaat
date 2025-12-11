'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
const constant = require('../constants/constant.json');
module.exports = (sequelize, DataTypes) => {
  class developer_user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      developer_user.belongsTo(models.developer, {
        foreignKey: 'developer_fk',
        targetKey: 'developer_id',
      });
      developer_user.belongsTo(models.user, {
        foreignKey: 'user_fk',
        targetKey: 'user_id',
      });
    }
  }
  let fields = {
    developer_user_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    developer_fk: DataTypes.UUID,
    user_fk: DataTypes.UUID,
    status: {
      type: DataTypes.STRING,
      defaultValue: constant.DEVELOPER.USER.STATUS.ACTIVE,
    },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  developer_user.init(fields, {
    sequelize,
    modelName: 'developer_user',
    freezeTableName: true,
    timestamps: false,
  });
  return developer_user;
};
