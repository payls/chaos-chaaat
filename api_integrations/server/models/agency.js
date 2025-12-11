'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class agency extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      agency.hasMany(models.agency_user, { foreignKey: 'agency_fk' });
      agency.hasMany(models.contact, { foreignKey: 'agency_fk' });
      agency.hasMany(models.project, { foreignKey: 'agency_fk' });
      agency.hasMany(models.agency_report, { foreignKey: 'agency_fk' });
      agency.hasMany(models.contact_view, { foreignKey: 'agency_fk' });
      agency.belongsTo(models.subscription, {
        foreignKey: 'agency_subscription_fk',
        targetKey: 'subscription_id',
      });
      agency.hasOne(models.agency_oauth, { foreignKey: 'agency_fk' });
      agency.hasMany(models.hubspot_form, { foreignKey: 'agency_fk' });
    }
  }
  let fields = {
    agency_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_name: { type: DataTypes.STRING },
    agency_logo_url: { type: DataTypes.TEXT },
    agency_logo_whitebg_url: { type: DataTypes.TEXT },
    agency_size: { type: DataTypes.STRING },
    agency_subdomain: { type: DataTypes.STRING },
    agency_type: { type: DataTypes.STRING },
    agency_website: { type: DataTypes.TEXT },
    agency_subscription_fk: { type: DataTypes.INTEGER, defaultValue: 5 },
    hubspot_id: { type: DataTypes.STRING },
    agency_whatsapp_api_token: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    agency_whatsapp_api_secret: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  agency.init(fields, {
    sequelize,
    modelName: 'agency',
    freezeTableName: true,
    timestamps: false,
  });
  return agency;
};
