'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class agency_user_tray_solution extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      agency_user_tray_solution.hasOne(models.agency_user_tray, {
        foreignKey: 'agency_user_tray_id',
      });
      agency_user_tray_solution.belongsTo(models.agency_user_tray, {
        foreignKey: 'agency_user_tray_fk',
        targetKey: 'agency_user_tray_id',
      });
    }
  }

  let fields = {
    agency_user_tray_solution_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_user_tray_fk: DataTypes.UUID,
    tray_user_config_wizard_id: DataTypes.TEXT,
    tray_user_solution_id: DataTypes.TEXT,
    tray_user_solution_instance_id: DataTypes.TEXT,
    tray_user_solution_instance_auth: DataTypes.TEXT,
    tray_user_solution_source_type: DataTypes.TEXT,
    tray_user_solution_instance_webhook_trigger: DataTypes.TEXT,
    tray_user_solution_instance_status: DataTypes.TEXT,
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  agency_user_tray_solution.init(fields, {
    sequelize,
    modelName: 'agency_user_tray_solution',
    freezeTableName: true,
    timestamps: false,
  });
  return agency_user_tray_solution;
};
