'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class email_notification_setting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      email_notification_setting.belongsTo(models.agency_user, {
        foreignKey: 'agency_user_fk',
        targetKey: 'agency_user_id',
      });
    }
  }

  let fields = {
    email_notification_setting_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_user_fk: { type: DataTypes.UUID },
    notification_type: { type: DataTypes.STRING },
    status: { type: DataTypes.BOOLEAN },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  email_notification_setting.init(fields, {
    sequelize,
    modelName: 'email_notification_setting',
    freezeTableName: true,
    timestamps: false,
  });

  return email_notification_setting;
};
