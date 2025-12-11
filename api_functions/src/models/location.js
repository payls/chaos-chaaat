'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const h = require('../helpers');
module.exports = (sequelize, DataTypes) => {
  class location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      location.belongsTo(models.project_location_map, {
        foreignKey: 'project_location_map_fk',
        targetKey: 'project_location_map_id',
      });
      location.belongsTo(models.project_location_nearby, {
        foreignKey: 'project_location_nearby_fk',
        targetKey: 'project_location_nearby_id',
      });
    }
  }
  let fields = {
    location_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
      primaryKey: true,
    },
    project_location_map_fk: DataTypes.UUID,
    project_location_nearby_fk: DataTypes.UUID,
    name: DataTypes.STRING,
    address: DataTypes.TEXT,
    lat: DataTypes.DECIMAL(40, 20),
    lng: DataTypes.DECIMAL(40, 20),
    google_map_url: DataTypes.TEXT,
  };
  fields = h.database.attachModelDefinition(fields, DataTypes);
  location.init(fields, {
    sequelize,
    modelName: 'location',
    freezeTableName: true,
    timestamps: false,
  });
  return location;
};
