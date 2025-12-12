'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class agency_oauth extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      agency_oauth.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });
    }
  }

  let fields = {
    agency_oauth_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING },
    source: { type: DataTypes.STRING },
    access_info: { type: DataTypes.TEXT },
    webhook_info: { type: DataTypes.TEXT },
    crm_timeslot_settings: { type: DataTypes.TEXT },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  agency_oauth.init(fields, {
    sequelize,
    modelName: 'agency_oauth',
    freezeTableName: true,
    timestamps: false,
  });

  return agency_oauth;
};
