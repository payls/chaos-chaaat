'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class task_message_attachment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      task_message_attachment.belongsTo(models.task_message, {
        foreignKey: 'task_message_fk',
        targetKey: 'task_message_id',
      });
    }
  }
  let fields = {
    task_message_attachment_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    task_message_fk: DataTypes.UUID,
    file_name: DataTypes.TEXT,
    file_url: DataTypes.TEXT,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  task_message_attachment.init(fields, {
    sequelize,
    modelName: 'task_message_attachment',
    freezeTableName: true,
    timestamps: false,
  });
  return task_message_attachment;
};
