'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class agency_channel_config extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      agency_channel_config.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });

      agency_channel_config.hasMany(models.line_chat, {
        foreignKey: 'sender',
      });

      agency_channel_config.hasMany(models.line_template, {
        foreignKey: 'line_channel',
      });

      agency_channel_config.hasMany(models.line_message_tracker, {
        foreignKey: 'sender',
      });
    }
  }
  let fields = {
    agency_channel_config_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.UUID },
    channel_id: { type: DataTypes.STRING },
    channel_name: { type: DataTypes.STRING },
    bot_id: { type: DataTypes.STRING },
    sent_opt_in_message: { type: DataTypes.STRING },
    opt_in_message: { type: DataTypes.STRING },
    channel_type: { type: DataTypes.STRING },
    uib_api_token: { type: DataTypes.STRING },
    uib_api_secret: { type: DataTypes.STRING },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  agency_channel_config.init(fields, {
    sequelize,
    modelName: 'agency_channel_config',
    freezeTableName: true,
    timestamps: false,
  });
  return agency_channel_config;
};
