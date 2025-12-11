'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      task.belongsTo(models.user, {
        foreignKey: 'owner_fk',
        targetKey: 'user_id',
      });
      task.hasMany(models.task_message, { foreignKey: 'task_fk' });
      task.hasMany(models.task_permission, { foreignKey: 'task_fk' });
    }
  }
  let fields = {
    task_id: { type: DataTypes.UUID, defaultValue: uuidv4(), primaryKey: true },
    owner_type: DataTypes.STRING, // constant.OWNER.TYPE
    owner_fk: DataTypes.UUID,
    subject: DataTypes.TEXT,
    type: DataTypes.STRING, // constant.TASK.TYPE
    type_sub: DataTypes.STRING, // constant.TASK.TYPE_SUB
    status: DataTypes.STRING, // constant.TASK.STATUS
    status_updated_date: DataTypes.DATE,
    status_updated_date_seconds: {
      type: DataTypes.VIRTUAL,
      get() {
        return h.date.formatDateToSeconds(this.status_updated_date, true);
      },
    },
    status_updated_date_time_ago: {
      type: DataTypes.VIRTUAL,
      get() {
        return h.date.formatTimeAgo(this.status_updated_date, true);
      },
    },
    is_deleted: { type: DataTypes.INTEGER, defaultValue: 0 },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  task.init(fields, {
    sequelize,
    modelName: 'task',
    freezeTableName: true,
    timestamps: false,
  });
  return task;
};
