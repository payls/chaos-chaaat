'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class agency_whatsapp_config extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      agency_whatsapp_config.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });

      agency_whatsapp_config.hasMany(models.waba_template, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_fk',
      });
    }
  }
  let fields = {
    agency_whatsapp_config_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.UUID },
    whatsapp_onboarding_fk: { type: DataTypes.UUID },
    waba_name: { type: DataTypes.STRING },
    waba_number: { type: DataTypes.STRING },
    agency_whatsapp_api_token: { type: DataTypes.STRING },
    agency_whatsapp_api_secret: { type: DataTypes.STRING },
    agency_waba_id: { type: DataTypes.STRING },
    agency_waba_template_token: { type: DataTypes.STRING },
    agency_waba_template_secret: { type: DataTypes.STRING },
    waba_status: { type: DataTypes.STRING },
    waba_quality: { type: DataTypes.STRING },
    daily_messaging_limit: { type: DataTypes.STRING },
    trial_number: { type: DataTypes.BOOLEAN },
    trial_number_to_use: { type: DataTypes.BOOLEAN },
    trial_code: { type: DataTypes.STRING },
    is_active: { type: DataTypes.BOOLEAN },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  agency_whatsapp_config.init(fields, {
    sequelize,
    modelName: 'agency_whatsapp_config',
    freezeTableName: true,
    timestamps: false,
  });
  return agency_whatsapp_config;
};
