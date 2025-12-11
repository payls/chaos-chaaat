'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class campaign_cta_options extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      campaign_cta_options.hasMany(models.whatsapp_message_tracker, {
        foreignKey: 'tracker_ref_name',
      });
    }
  }

  let fields = {
    campaign_cta_option_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    tracker_ref_name: { type: DataTypes.STRING },
    response_trigger: { type: DataTypes.STRING },
    response_body: { type: DataTypes.TEXT },
    response_options: { type: DataTypes.TEXT },
    second_response_body: { type: DataTypes.TEXT },
    second_response_options: { type: DataTypes.TEXT },
    final_response_body: { type: DataTypes.TEXT },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  campaign_cta_options.init(fields, {
    sequelize,
    modelName: 'campaign_cta_options',
    freezeTableName: true,
    timestamps: false,
  });

  return campaign_cta_options;
};
