'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class campaign_additional_cta extends Model {
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
    campaign_additional_cta_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.STRING },
    agency_whatsapp_config_fk: { type: DataTypes.STRING },
    cta_name: { type: DataTypes.STRING },
    cta_1: { type: DataTypes.TEXT },
    cta_2: { type: DataTypes.TEXT },
    final_response_body: { type: DataTypes.TEXT },
    final_response_body_2: { type: DataTypes.TEXT },
    final_response_body_3: { type: DataTypes.TEXT },
    closing_response_body: { type: DataTypes.TEXT },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  campaign_additional_cta.init(fields, {
    sequelize,
    modelName: 'campaign_additional_cta',
    freezeTableName: true,
    timestamps: false,
  });

  return campaign_additional_cta;
};
