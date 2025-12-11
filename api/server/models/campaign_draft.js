'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class campaign_draft extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      campaign_draft.hasMany(models.whatsapp_message_tracker, {
        foreignKey: 'tracker_ref_name',
      });
    }
  }

  let fields = {
    campaign_draft_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.STRING },
    configuration: { type: DataTypes.TEXT },
    platform: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  campaign_draft.init(fields, {
    sequelize,
    modelName: 'campaign_draft',
    freezeTableName: true,
    timestamps: false,
  });

  return campaign_draft;
};
