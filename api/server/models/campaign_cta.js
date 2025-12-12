'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class campaign_cta extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      campaign_cta.hasMany(models.whatsapp_message_tracker, {
        foreignKey: 'tracker_ref_name',
      });
    }
  }

  let fields = {
    campaign_cta_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    campaign_tracker_ref_name: { type: DataTypes.STRING },
    message_channel: { type: DataTypes.STRING },
    is_workflow: { type: DataTypes.BOOLEAN },
    message_flow_data: { type: DataTypes.TEXT },
    cta_1: { type: DataTypes.STRING },
    cta_1_response: { type: DataTypes.TEXT },
    trigger_cta_1_options: { type: DataTypes.STRING },
    cta_1_option_type: { type: DataTypes.INTEGER },
    cta_2: { type: DataTypes.STRING },
    cta_2_response: { type: DataTypes.TEXT },
    trigger_cta_2_options: { type: DataTypes.STRING },
    cta_2_option_type: { type: DataTypes.INTEGER },
    cta_3: { type: DataTypes.STRING },
    cta_3_response: { type: DataTypes.TEXT },
    trigger_cta_3_options: { type: DataTypes.STRING },
    cta_3_option_type: { type: DataTypes.INTEGER },
    cta_4: { type: DataTypes.STRING },
    cta_4_response: { type: DataTypes.TEXT },
    trigger_cta_4_options: { type: DataTypes.STRING },
    cta_4_option_type: { type: DataTypes.INTEGER },
    cta_5: { type: DataTypes.STRING },
    cta_5_response: { type: DataTypes.TEXT },
    trigger_cta_5_options: { type: DataTypes.STRING },
    cta_5_option_type: { type: DataTypes.INTEGER },
    cta_1_final_response: { type: DataTypes.TEXT },
    cta_2_final_response: { type: DataTypes.TEXT },
    cta_3_final_response: { type: DataTypes.TEXT },
    cta_4_final_response: { type: DataTypes.TEXT },
    cta_5_final_response: { type: DataTypes.TEXT },
    cta_6: { type: DataTypes.STRING },
    cta_6_response: { type: DataTypes.TEXT },
    trigger_cta_6_options: { type: DataTypes.STRING },
    cta_6_final_response: { type: DataTypes.TEXT },
    cta_6_option_type: { type: DataTypes.INTEGER },
    cta_7: { type: DataTypes.STRING },
    cta_7_response: { type: DataTypes.TEXT },
    trigger_cta_7_options: { type: DataTypes.STRING },
    cta_7_final_response: { type: DataTypes.TEXT },
    cta_7_option_type: { type: DataTypes.INTEGER },
    cta_8: { type: DataTypes.STRING },
    cta_8_response: { type: DataTypes.TEXT },
    trigger_cta_8_options: { type: DataTypes.STRING },
    cta_8_final_response: { type: DataTypes.TEXT },
    cta_8_option_type: { type: DataTypes.INTEGER },
    cta_9: { type: DataTypes.STRING },
    cta_9_response: { type: DataTypes.TEXT },
    trigger_cta_9_options: { type: DataTypes.STRING },
    cta_9_final_response: { type: DataTypes.TEXT },
    cta_9_option_type: { type: DataTypes.INTEGER },
    cta_10: { type: DataTypes.STRING },
    cta_10_response: { type: DataTypes.TEXT },
    trigger_cta_10_options: { type: DataTypes.STRING },
    cta_10_final_response: { type: DataTypes.TEXT },
    cta_10_option_type: { type: DataTypes.INTEGER },
    campaign_notification_additional_recipients: { type: DataTypes.STRING },
    is_confirmation: { type: DataTypes.BOOLEAN },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  campaign_cta.init(fields, {
    sequelize,
    modelName: 'campaign_cta',
    freezeTableName: true,
    timestamps: false,
  });

  return campaign_cta;
};
