'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class task_permission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      task_permission.belongsTo(models.task, {
        foreignKey: 'task_fk',
        targetKey: 'task_id',
      });
    }
  }
  let fields = {
    task_permission_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    task_fk: DataTypes.UUID,
    owner_type: DataTypes.STRING, // constant.OWNER.TYPE
    owner_fk: DataTypes.UUID,
    action: DataTypes.STRING, // constant.PERMISSION.ACTION
    permission: DataTypes.INTEGER,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  task_permission.init(fields, {
    sequelize,
    modelName: 'task_permission',
    freezeTableName: true,
    timestamps: false,
  });
  return task_permission;
};
