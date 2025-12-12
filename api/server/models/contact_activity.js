'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class contact_activity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      contact_activity.belongsTo(models.contact, {
        foreignKey: 'contact_fk',
        targetKey: 'contact_id',
      });
    }
  }
  let fields = {
    contact_activity_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    contact_fk: DataTypes.UUID,
    activity_type: DataTypes.STRING,
    activity_meta: DataTypes.TEXT,
    activity_ip: DataTypes.STRING(15),
    viewed_on_device: DataTypes.STRING,
    activity_date: DataTypes.DATE,
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  contact_activity.init(fields, {
    sequelize,
    modelName: 'contact_activity',
    freezeTableName: true,
    timestamps: false,
  });
  return contact_activity;
};
