'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class agency_report extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      agency_report.belongsTo(models.agency, {
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
  };

  fields = h.database.attachModelDefinition(fields, DataTypes);
  agency_report.init(fields, {
    sequelize,
    modelName: 'agency_oauth',
    freezeTableName: true,
    timestamps: false,
  });

  return agency_report;
};
