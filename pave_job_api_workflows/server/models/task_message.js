'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class task_message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      task_message.belongsTo(models.task, {
        foreignKey: 'task_fk',
        targetKey: 'task_id',
      });
      task_message.belongsTo(models.user, {
        foreignKey: 'user_fk',
        targetKey: 'user_id',
      });
      task_message.hasMany(models.task_message_attachment, {
        foreignKey: 'task_message_fk',
      });
    }
  }
  let fields = {
    task_message_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    task_fk: DataTypes.UUID,
    user_fk: DataTypes.UUID,
    type: DataTypes.STRING, // constant.TASK.MESSAGE.TYPE
    message: DataTypes.TEXT,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  task_message.init(fields, {
    sequelize,
    modelName: 'task_message',
    freezeTableName: true,
    timestamps: false,
  });
  return task_message;
};
