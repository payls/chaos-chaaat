'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class campaign_schedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      // define association here
    }
  }
  let fields = {
    campaign_schedule_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.UUID },
    tracker_ref_name: { type: DataTypes.STRING },
    campaign_name: { type: DataTypes.STRING },
    recipient_count: { type: DataTypes.INTEGER },
    slack_notification: { type: DataTypes.STRING },
    campaign_source: { type: DataTypes.TEXT },
    send_date: { type: DataTypes.DATE },
    time_zone: { type: DataTypes.STRING },
    status: { type: DataTypes.INTEGER },
    triggered: { type: DataTypes.BOOLEAN },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  campaign_schedule.init(fields, {
    sequelize,
    modelName: 'campaign_schedule',
    freezeTableName: true,
    timestamps: false,
  });

  return campaign_schedule;
};
