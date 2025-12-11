'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');

module.exports = (sequelize, DataTypes) => {
  class agency_salesforce_city extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      agency_salesforce_city.belongsTo(models.agency, {
        foreignKey: 'agency_fk',
        targetKey: 'agency_id',
      });
    }
  }

  let fields = {
    agency_salesforce_city_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    agency_fk: DataTypes.UUID,
    sf_city_id: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING },
    code: { type: DataTypes.STRING },
    language: { type: DataTypes.STRING },
    country: { type: DataTypes.STRING },
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  agency_salesforce_city.init(fields, {
    sequelize,
    modelName: 'agency_salesforce_city',
    freezeTableName: true,
    timestamps: false,
  });

  return agency_salesforce_city;
};
