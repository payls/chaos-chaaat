'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class contact_salesforce_data extends Model {
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
    contact_salesforce_data_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.STRING },
    contact_fk: { type: DataTypes.STRING },
    first_name: { type: DataTypes.STRING },
    last_name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    mobile: { type: DataTypes.STRING },
    language: { type: DataTypes.STRING },
    interested_product: { type: DataTypes.STRING },
    interested_city: { type: DataTypes.STRING },
    lead_source: { type: DataTypes.STRING },
    lead_source_lv1: { type: DataTypes.STRING },
    lead_source_lv2: { type: DataTypes.STRING },
    enable_marketing: { type: DataTypes.BOOLEAN },
    tnc_agree: { type: DataTypes.BOOLEAN },
    tnc_date: { type: DataTypes.DATE },
    data_synced: { type: DataTypes.BOOLEAN },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  contact_salesforce_data.init(fields, {
    sequelize,
    modelName: 'contact_salesforce_data',
    freezeTableName: true,
    timestamps: false,
  });

  return contact_salesforce_data;
};
