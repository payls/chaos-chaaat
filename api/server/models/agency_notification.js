'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class agency_notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      agency_notification.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
      });
    }
  }
  let fields = {
    agency_notification_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.UUID },
    agency_subscription_fk: { type: DataTypes.UUID },
    notification_type: { type: DataTypes.STRING },
    notification_subject: { type: DataTypes.TEXT },
    message: { type: DataTypes.TEXT },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  agency_notification.init(fields, {
    sequelize,
    modelName: 'agency_notification',
    freezeTableName: true,
    timestamps: false,
  });
  return agency_notification;
};
