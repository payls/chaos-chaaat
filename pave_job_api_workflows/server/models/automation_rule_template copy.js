'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class automation_rule_template extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  let fields = {
    automation_rule_template_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    automation_rule_fk: {
      type: DataTypes.UUID,
    },
    message_channel: { type: DataTypes.STRING },
    business_account: { type: DataTypes.STRING },
    is_workflow: { type: DataTypes.BOOLEAN },
    message_flow_data: { type: DataTypes.TEXT },
    template_fk: {
      type: DataTypes.UUID,
    },
    cta_1_response: { type: DataTypes.TEXT },
    trigger_cta_1_options: { type: DataTypes.STRING },
    cta_1_final_response: { type: DataTypes.TEXT },
    cta_1_option_type: { type: DataTypes.INTEGER },
    cta_2_response: { type: DataTypes.TEXT },
    trigger_cta_2_options: { type: DataTypes.STRING },
    cta_2_final_response: { type: DataTypes.TEXT },
    cta_2_option_type: { type: DataTypes.INTEGER },
    cta_3_response: { type: DataTypes.TEXT },
    trigger_cta_3_options: { type: DataTypes.STRING },
    cta_3_final_response: { type: DataTypes.TEXT },
    cta_3_option_type: { type: DataTypes.INTEGER },
    cta_4_response: { type: DataTypes.TEXT },
    trigger_cta_4_options: { type: DataTypes.STRING },
    cta_4_final_response: { type: DataTypes.TEXT },
    cta_4_option_type: { type: DataTypes.INTEGER },
    cta_5_response: { type: DataTypes.TEXT },
    trigger_cta_5_options: { type: DataTypes.STRING },
    cta_5_final_response: { type: DataTypes.TEXT },
    cta_5_option_type: { type: DataTypes.INTEGER },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  automation_rule_template.init(fields, {
    sequelize,
    modelName: 'automation_rule_template',
    freezeTableName: true,
    timestamps: false,
  });
  return automation_rule_template;
};
