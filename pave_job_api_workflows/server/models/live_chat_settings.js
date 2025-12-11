'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class live_chat_settings extends Model {
    static associate(models) {
      live_chat_settings.belongsTo(models.agency_user, {
        foreignKey: 'agency_user_fk',
        targetKey: 'agency_user_id',
      });
    }
  }
  let fields = {
    live_chat_settings_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.UUID },
    agency_user_fk: { type: DataTypes.UUID },
    allowed_domain: { type: DataTypes.TEXT },
    chat_start_time: { type: DataTypes.TEXT },
    chat_end_time: { type: DataTypes.TEXT },
    chat_frequency: { type: DataTypes.TEXT },
    styles: { type: DataTypes.TEXT },
    salesforce_enabled: { type: DataTypes.BOOLEAN },
    salesforce_transmission_type: { type: DataTypes.STRING },
    salesforce_chat_logs_transmission_enabled: { type: DataTypes.BOOLEAN },
    salesforce_chat_logs_transmission_field: { type: DataTypes.STRING },
    api_oauth_url: { type: DataTypes.TEXT },
    oauth_method: { type: DataTypes.STRING },
    api_url: { type: DataTypes.TEXT },
    create_method: { type: DataTypes.STRING },
    api_update_url: { type: DataTypes.TEXT },
    update_method: { type: DataTypes.STRING },
    api_message_url: { type: DataTypes.TEXT },
    message_method: { type: DataTypes.STRING },
    add_salesforce_id: { type: DataTypes.BOOLEAN },
    api_data_pull_url: { type: DataTypes.TEXT },
    pull_method: { type: DataTypes.STRING },
    api_client_id: { type: DataTypes.TEXT },
    api_client_secret: { type: DataTypes.TEXT },
    api_token: { type: DataTypes.TEXT },
    api_update_token: { type: DataTypes.TEXT },
    api_message_token: { type: DataTypes.TEXT },
    field_configuration: { type: DataTypes.TEXT },
    waba_number: { type: DataTypes.TEXT },
    whatsapp_salesforce_enabled: { type: DataTypes.BOOLEAN },
    line_salesforce_enabled: { type: DataTypes.BOOLEAN },
    status: { type: DataTypes.TEXT },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  live_chat_settings.init(fields, {
    sequelize,
    modelName: 'live_chat_settings',
    freezeTableName: true,
    timestamps: false,
  });
  return live_chat_settings;
};
