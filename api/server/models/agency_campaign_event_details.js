'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class agency_campaign_event_details extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      agency_campaign_event_details.belongsTo(models.whatsapp_message_tracker, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_fk',
      });
    }
  }

  let fields = {
    agency_campaign_event_detail_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.STRING },
    tracker_ref_name: { type: DataTypes.STRING },
    campaign: { type: DataTypes.STRING },
    event_details: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING, defaultValue: 'active' },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  agency_campaign_event_details.init(fields, {
    sequelize,
    modelName: 'agency_campaign_event_details',
    freezeTableName: true,
    timestamps: false,
  });

  return agency_campaign_event_details;
};
