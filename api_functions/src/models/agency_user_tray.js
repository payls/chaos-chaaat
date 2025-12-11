'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class agency_user_tray extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      agency_user_tray.hasOne(models.agency_user, {
        foreignKey: 'agency_user_id',
      });
    }
  }

  let fields = {
    agency_user_tray_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_user_fk: DataTypes.UUID,
    tray_user_fk: DataTypes.TEXT,
    tray_user_fk_master_token: DataTypes.TEXT,
    tray_user_name: DataTypes.TEXT,
    is_deleted: DataTypes.BOOLEAN,
    source_meta: DataTypes.TEXT,
    source_original_payload: DataTypes.TEXT,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  agency_user_tray.init(fields, {
    sequelize,
    modelName: 'agency_user_tray',
    freezeTableName: true,
    timestamps: false,
  });
  return agency_user_tray;
};
