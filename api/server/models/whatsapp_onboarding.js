'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class whatsapp_onboarding extends Model {
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
    whatsapp_onboarding_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.STRING },
    partner_id: { type: DataTypes.STRING },
    customer: { type: DataTypes.STRING },
    onboarding_channel: { type: DataTypes.STRING },
    facebook_manager_id: { type: DataTypes.STRING },
    client_company_name: { type: DataTypes.STRING },
    display_image: { type: DataTypes.TEXT },
    about: { type: DataTypes.TEXT },
    whatsapp_status: { type: DataTypes.STRING },
    address: { type: DataTypes.TEXT },
    email: { type: DataTypes.STRING },
    website: { type: DataTypes.STRING },
    webhook_url: { type: DataTypes.STRING },
    headers: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING },
    pending_date: { type: DataTypes.DATE },
    submitted_date: { type: DataTypes.DATE },
    confirmed_date: { type: DataTypes.DATE },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  whatsapp_onboarding.init(fields, {
    sequelize,
    modelName: 'whatsapp_onboarding',
    freezeTableName: true,
    timestamps: false,
  });

  return whatsapp_onboarding;
};
