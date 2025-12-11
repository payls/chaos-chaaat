'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class agency_config extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      agency_config.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });
    }
  }
  let fields = {
    agency_config_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.UUID },
    hubspot_config: { type: DataTypes.TEXT },
    salesforce_config: { type: DataTypes.TEXT },
    pave_config: { type: DataTypes.TEXT },
    whatsapp_config: { type: DataTypes.TEXT },
    sms_config: { type: DataTypes.TEXT },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  agency_config.init(fields, {
    sequelize,
    modelName: 'agency_config',
    freezeTableName: true,
    timestamps: false,
  });
  return agency_config;
};
